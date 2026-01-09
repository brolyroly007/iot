/*
 * FallGuard - Sistema de Deteccion de Caidas
 * ESP32-CAM + MPU6050
 *
 * Universidad Nacional del Altiplano - Puno
 * Curso: Internet de las Cosas
 *
 * Funcionalidades:
 * - Deteccion de caidas mediante acelerometro MPU6050
 * - Captura de foto al detectar caida
 * - Envio de alerta con foto a servidor
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>

// ==================== CONFIGURACION ====================
// WiFi
const char* ssid = "TU_WIFI_NOMBRE";
const char* password = "TU_WIFI_PASSWORD";

// Servidor (tu URL de Vercel)
const char* serverUrl = "https://tu-app.vercel.app/api/fall-detection";

// Codigo del dispositivo (obtenlo del dashboard)
const char* codigoDispositivo = "FG-XXXXXX";

// ==================== PINES ESP32-CAM ====================
// Modelo AI-Thinker ESP32-CAM
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// Pines I2C para MPU6050 (usando GPIO 14 y 15)
#define I2C_SDA 14
#define I2C_SCL 15

// Pin para buzzer/alarma
#define BUZZER_PIN 13

// ==================== MPU6050 ====================
#define MPU6050_ADDR 0x68

// Variables del acelerometro
float accelX, accelY, accelZ;
float accelMagnitude;

// ==================== DETECCION DE CAIDAS ====================
// Umbrales
const float UMBRAL_CAIDA_LIBRE = 0.5;  // < 0.5G = caida libre
const float UMBRAL_IMPACTO = 2.5;       // > 2.5G = impacto
const unsigned long VENTANA_TIEMPO = 1000; // 1 segundo

// Estados
bool caidaLibreDetectada = false;
unsigned long tiempoCaidaLibre = 0;
bool alertaEnviada = false;
unsigned long ultimaAlerta = 0;
const unsigned long COOLDOWN_ALERTA = 30000; // 30 segundos entre alertas

// ==================== FUNCIONES ====================

void initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  // Calidad de imagen
  config.frame_size = FRAMESIZE_VGA; // 640x480
  config.jpeg_quality = 12;
  config.fb_count = 1;

  // Inicializar camara
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Error inicializando camara: 0x%x\n", err);
    return;
  }

  Serial.println("Camara inicializada correctamente");
}

void initMPU6050() {
  Wire.begin(I2C_SDA, I2C_SCL);
  Wire.setClock(100000);

  // Despertar MPU6050
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(0x6B); // PWR_MGMT_1
  Wire.write(0x00); // Despertar
  byte error = Wire.endTransmission();

  if (error == 0) {
    Serial.println("MPU6050 inicializado correctamente");

    // Configurar rango del acelerometro a +-8G
    Wire.beginTransmission(MPU6050_ADDR);
    Wire.write(0x1C); // ACCEL_CONFIG
    Wire.write(0x10); // +-8G
    Wire.endTransmission();
  } else {
    Serial.println("ERROR: No se pudo conectar con MPU6050");
    Serial.println("Verifica las conexiones:");
    Serial.println("  MPU6050 SDA -> GPIO 14");
    Serial.println("  MPU6050 SCL -> GPIO 15");
  }
}

void readAccelerometer() {
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(0x3B); // Registro ACCEL_XOUT_H
  Wire.endTransmission(false);
  Wire.requestFrom(MPU6050_ADDR, 6, true);

  if (Wire.available() >= 6) {
    int16_t rawX = Wire.read() << 8 | Wire.read();
    int16_t rawY = Wire.read() << 8 | Wire.read();
    int16_t rawZ = Wire.read() << 8 | Wire.read();

    // Convertir a G (rango +-8G = 4096 LSB/G)
    accelX = rawX / 4096.0;
    accelY = rawY / 4096.0;
    accelZ = rawZ / 4096.0;

    // Calcular magnitud total
    accelMagnitude = sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ);
  }
}

camera_fb_t* capturePhoto() {
  Serial.println("Capturando foto...");

  camera_fb_t* fb = esp_camera_fb_get();

  if (!fb) {
    Serial.println("Error capturando foto");
    return NULL;
  }

  Serial.printf("Foto capturada: %d bytes\n", fb->len);
  return fb;
}

void sendAlertWithPhoto(float magnitude) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado, no se puede enviar alerta");
    return;
  }

  // Capturar foto
  camera_fb_t* fb = capturePhoto();

  HTTPClient http;
  http.begin(serverUrl);
  http.setTimeout(15000);

  if (fb != NULL) {
    // Enviar con foto (multipart/form-data)
    String boundary = "----FallGuardBoundary";
    String contentType = "multipart/form-data; boundary=" + boundary;

    // Construir el cuerpo multipart
    String bodyStart = "--" + boundary + "\r\n";
    bodyStart += "Content-Disposition: form-data; name=\"evento\"\r\n\r\n";
    bodyStart += "caida\r\n";
    bodyStart += "--" + boundary + "\r\n";
    bodyStart += "Content-Disposition: form-data; name=\"magnitud\"\r\n\r\n";
    bodyStart += String(magnitude, 2) + "\r\n";
    bodyStart += "--" + boundary + "\r\n";
    bodyStart += "Content-Disposition: form-data; name=\"codigo\"\r\n\r\n";
    bodyStart += String(codigoDispositivo) + "\r\n";
    bodyStart += "--" + boundary + "\r\n";
    bodyStart += "Content-Disposition: form-data; name=\"foto\"; filename=\"caida.jpg\"\r\n";
    bodyStart += "Content-Type: image/jpeg\r\n\r\n";

    String bodyEnd = "\r\n--" + boundary + "--\r\n";

    size_t totalLen = bodyStart.length() + fb->len + bodyEnd.length();

    // Crear buffer con todo el contenido
    uint8_t* payload = (uint8_t*)malloc(totalLen);
    if (payload) {
      memcpy(payload, bodyStart.c_str(), bodyStart.length());
      memcpy(payload + bodyStart.length(), fb->buf, fb->len);
      memcpy(payload + bodyStart.length() + fb->len, bodyEnd.c_str(), bodyEnd.length());

      http.addHeader("Content-Type", contentType);

      Serial.println("Enviando alerta con foto...");
      int httpCode = http.POST(payload, totalLen);

      if (httpCode > 0) {
        String response = http.getString();
        Serial.printf("Respuesta servidor (%d): %s\n", httpCode, response.c_str());
      } else {
        Serial.printf("Error HTTP: %s\n", http.errorToString(httpCode).c_str());
      }

      free(payload);
    }

    esp_camera_fb_return(fb);
  } else {
    // Enviar sin foto (JSON)
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{";
    jsonPayload += "\"evento\":\"caida\",";
    jsonPayload += "\"magnitud\":" + String(magnitude, 2) + ",";
    jsonPayload += "\"codigo\":\"" + String(codigoDispositivo) + "\"";
    jsonPayload += "}";

    Serial.println("Enviando alerta sin foto...");
    int httpCode = http.POST(jsonPayload);

    if (httpCode > 0) {
      String response = http.getString();
      Serial.printf("Respuesta servidor (%d): %s\n", httpCode, response.c_str());
    } else {
      Serial.printf("Error HTTP: %s\n", http.errorToString(httpCode).c_str());
    }
  }

  http.end();
}

void activarAlarma() {
  // Activar buzzer con patron de alarma
  for (int i = 0; i < 5; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(200);
    digitalWrite(BUZZER_PIN, LOW);
    delay(100);
  }
}

void detectarCaida() {
  unsigned long ahora = millis();

  // Verificar cooldown
  if (alertaEnviada && (ahora - ultimaAlerta < COOLDOWN_ALERTA)) {
    return;
  }

  // Fase 1: Detectar caida libre
  if (accelMagnitude < UMBRAL_CAIDA_LIBRE) {
    if (!caidaLibreDetectada) {
      caidaLibreDetectada = true;
      tiempoCaidaLibre = ahora;
      Serial.println("! Caida libre detectada");
    }
  }

  // Fase 2: Detectar impacto despues de caida libre
  if (caidaLibreDetectada) {
    if (ahora - tiempoCaidaLibre > VENTANA_TIEMPO) {
      // Tiempo expirado sin impacto
      caidaLibreDetectada = false;
      Serial.println("  Caida libre sin impacto - resetear");
    } else if (accelMagnitude > UMBRAL_IMPACTO) {
      // CAIDA CONFIRMADA!
      Serial.println("!!! CAIDA DETECTADA !!!");
      Serial.printf("    Magnitud impacto: %.2f G\n", accelMagnitude);

      // Activar alarma
      activarAlarma();

      // Enviar alerta con foto
      sendAlertWithPhoto(accelMagnitude);

      // Resetear estados
      caidaLibreDetectada = false;
      alertaEnviada = true;
      ultimaAlerta = ahora;
    }
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n=================================");
  Serial.println("  FallGuard - Detector de Caidas");
  Serial.println("  Universidad Nacional del Altiplano");
  Serial.println("=================================\n");

  // Configurar pin buzzer
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // Conectar WiFi
  Serial.printf("Conectando a WiFi: %s\n", ssid);
  WiFi.begin(ssid, password);

  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 30) {
    delay(500);
    Serial.print(".");
    intentos++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi conectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nError conectando WiFi");
  }

  // Inicializar camara
  initCamera();

  // Inicializar MPU6050
  initMPU6050();

  // Beep inicial
  digitalWrite(BUZZER_PIN, HIGH);
  delay(100);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.println("\nSistema listo!");
  Serial.println("Monitoreando caidas...\n");
}

void loop() {
  // Leer acelerometro
  readAccelerometer();

  // Detectar caidas
  detectarCaida();

  // Mostrar valores cada segundo (para debug)
  static unsigned long ultimoDebug = 0;
  if (millis() - ultimoDebug > 1000) {
    Serial.printf("Accel: X=%.2f Y=%.2f Z=%.2f | Mag=%.2f G\n",
                  accelX, accelY, accelZ, accelMagnitude);
    ultimoDebug = millis();
  }

  delay(10); // 100 Hz de muestreo
}

// ==================== FUNCION DE PRUEBA ====================
// Descomenta esta funcion en loop() para probar sin MPU6050
/*
void testSinMPU() {
  // Simular caida cada 30 segundos
  static unsigned long ultimoTest = 0;
  if (millis() - ultimoTest > 30000) {
    Serial.println("=== PRUEBA DE CAIDA SIMULADA ===");
    activarAlarma();
    sendAlertWithPhoto(3.5);
    ultimoTest = millis();
  }
}
*/
