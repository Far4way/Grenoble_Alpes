#include <Arduino.h>
#include "HermAs.h"
#include "AsserTH.h"
#include "DHT.h"

//declaration des methodes

//constructeur
AsserTH::AsserTH( float arg_Kp, float arg_Ki, float arg_Kd,  float arg_Tdesired, float arg_Hdesired) :
Kp(arg_Kp), Ki(arg_Ki), Kd(arg_Kd), fail(0), e0({10,10,10,10}), integ(0), pwm(100), atomisor(1), Tdesired(arg_Tdesired), Hdesired(arg_Hdesired), nextExecution(0)
{

}


void AsserTH::Setup(){
  pinMode(PIN_RELAY_PWM, OUTPUT);
  //pinMode(PIN_BRUM0, OUTPUT);
  //pinMode(PIN_BRUM1, OUTPUT);

  pinMode(PIN_PORTE, INPUT);
  for (auto& sensor : Tab_dht) {
    sensor.begin();
  }
}


uint8_t AsserTH::THcontrol(uint8_t RalwaysOn_BrumOff){

  if( millis() >= nextExecution){
    nextExecution =  millis() + PAS_TIME;

    //if( digitalRead(PIN_PORTE) ) //turn off fan

  /*read the sensor value*/
    fail = 0;
    uint8_t i;
    for ( i = 0; i < 5; i++) {
      // humidity reading
      h[i] = Tab_dht[i].readHumidity();
      // temperature reading
      t[i] = Tab_dht[i].readTemperature();

      if (isnan(h[i]) || isnan(t[i])) fail = 1; //error reading
    }


  /*calculate temperature, and humidity average*/
    hm = (h[0] + h[1] + h[2] + h[3] + h[4]) / 5.0;
    tm = (t[0] + t[1] + t[2] + t[3] + t[4]) / 5.0;


  /*calculate the pwm order*/
    if( !fail ){
      e = Tdesired-tm; //error
      // integrator update
      integ += Ki*e*PAS_TIME/1000.0;

      //pwm calculate
      pwm = Kp*e + integ + Kd/(PAS_TIME/1000.0)*(e-e0[0]);
      e0[0]=e0[1];
      e0[1]=e0[2];
      e0[2]=e0[3];
      e0[3]=e;

      //pwm saturation
      if(pwm>100) pwm=100;
      //if(pwm<0) pwm=0; //unsigned, so unuseful
    }


  /* heating resistance control*/
    if(millis()%PERIODE <= pwm*PERIODE/100.0 || pwm==100 || (RalwaysOn_BrumOff&0xf0)>>4){
      digitalWrite(PIN_RELAY_PWM, HIGH);
    }
    else{
      digitalWrite(PIN_RELAY_PWM, LOW);
    }

  /*humidity control*/
    if(hm > Hdesired-0.5 || RalwaysOn_BrumOff&0x0f){
      atomisor=0;
      //digitalWrite(PIN_BRUM0, LOW);
      //digitalWrite(PIN_BRUM1, LOW);
    }
    else{
      atomisor=1;
      //digitalWrite(PIN_BRUM0, HIGH);
      //digitalWrite(PIN_BRUM1, HIGH);
    }


    return 1;
  }
  return 1;
}



void AsserTH_adapted::SetNbArgMeth(){

  nbArgFloat = 26;
  nbArgInt8 = 1;
  nbArgInt16 = 0;
  nbArgInt32 = 1;

  nbMethod = 1;
}


void AsserTH_adapted::SetArgMeth_inTab(){

  Tabfloat[0] = &h[0];
  Tabfloat[1] = &h[1];
  Tabfloat[2] = &h[2];
  Tabfloat[3] = &h[3];
  Tabfloat[4] = &h[4];
  Tabfloat[5] = &t[0];
  Tabfloat[6] = &t[1];
  Tabfloat[7] = &t[2];
  Tabfloat[8] = &t[3];
  Tabfloat[9] = &t[4];
  Tabfloat[10] = &hm;
  Tabfloat[11] = &tm;
  Tabfloat[12] = &Hdesired;
  Tabfloat[13] = &Tdesired;

  Tabfloat[14] = &e;
  Tabfloat[15] = &e0[0];
  Tabfloat[16] = &e0[1];
  Tabfloat[17] = &e0[2];
  Tabfloat[18] = &e0[3];
  Tabfloat[19] = &integ;

  Tabfloat[20] = &Kp;
  Tabfloat[21] = &Ki;
  Tabfloat[22] = &Kd;
  Tabfloat[23] = &pwm;


  Tabi8[0] = &atomisor;
  Tabi8[1] = &fail;


  Tabi32[0] = &nextExecution;


  TabMeth[0] = (OperatingClass::ptrf) &AsserTH_adapted::THcontrol;
}
