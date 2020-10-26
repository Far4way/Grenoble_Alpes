#ifndef AsserTH_h
#define AsserTH_h

#include "Arduino.h"
#include "DHT.h"   // Librairie des capteurs DHT


#define PIN_BRUM0 2
#define PIN_BRUM1 3

#define PIN_PORTE 4

#define PIN_SENSOR0 5
#define PIN_SENSOR1 6
#define PIN_SENSOR2 7
#define PIN_SENSOR3 8
#define PIN_SENSOR4 9


#define PIN_RELAY_PWM 19

#define PAS_TIME 225
#define PERIODE 2700


class THcontrol : public OperatingClass{

public:
//constructor
THcontrol( float arg_Kp, float arg_Ki, float arg_Kd, float arg_Tdesired=37.0, float arg_Hdesired=100.0);


uint8_t control(uint8_t RalwaysOn_BrumOff);

private:

  void Setup();

  void SetNbArgMeth();

  void SetArgMeth_inTab();

//declaration des arguments
DHT Tab_dht[5] = {
  {PIN_SENSOR0,DHT22},
  {PIN_SENSOR1,DHT22},
  {PIN_SENSOR2,DHT22},
  {PIN_SENSOR3,DHT22},
  {PIN_SENSOR4,DHT22},
};

uint8_t  fail;
float h[5], t[5];
float hm, tm;

float Tdesired;
float Hdesired;

float e;
float e0[4];
float integ;

float Kp;
float Ki;
float Kd;

uint8_t atomisor;

float pwm;

uint32_t nextExecution;
};


#endif
