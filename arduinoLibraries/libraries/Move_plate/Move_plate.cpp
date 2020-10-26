#include <Arduino.h>
#include <TMC2130Stepper.h>
#include "HermAs.h"
#include "Move_plate.h"

//constructeur
Move_plate::Move_plate() :
  PosX(-1), PosY(-1), X_order(0), Y_order(0), numWell(0), rpm(50), microS_time(0), RotState(0), indTabrot(0), TMC2130_X(EN_PIN_X, DIR_PIN_X, STEP_PIN_X, CS_PIN_X), TMC2130_Y(EN_PIN_Y, DIR_PIN_Y, STEP_PIN_Y, CS_PIN_Y)
  {

}


//Méthodes

void Move_plate::Setup(){
  TMC2130_X.begin(); // Initiate pins and registeries
  TMC2130_Y.begin();
  TMC2130_X.setCurrent(1200, 0.11,0.5); // Set stepper current to 600mA
  TMC2130_Y.setCurrent(1200, 0.11,0.5);
  TMC2130_X.stealthChop(1);
  TMC2130_Y.stealthChop(1);
  TMC2130_X.microsteps(0);
  TMC2130_Y.microsteps(0);
  digitalWrite(EN_PIN_X, LOW);
  digitalWrite(EN_PIN_Y, LOW);
  pinMode(POS_SENSOR_PIN_X, INPUT);
  pinMode(POS_SENSOR_PIN_Y, INPUT);

  //time_delay=floor(1.8/(rpm*6)*1000*1000); // 1.8 degrés par step en full step

  //moveTo_00();
}


uint8_t Move_plate::rotation(uint8_t unused){
  uint8_t result = 1;
  switch(RotState){
    case 0: //initialisation
      X_order = 500;
      Y_order = 350;

      if( micros() >= microS_time ){
        result = moveTo_order(1);
        if( result == 2 ){
          microS_time = micros() + floor(1.8/(3*6* (uint16_t)rpm)*1000000);
          indTabrot = 0;
          RotState = 1;
          return 1;
        }
        microS_time = micros() + 3000; //to execute every 5 ms
      }
        break;
      

    case 1: //continous rotation

      if( micros() >= microS_time){
        microS_time = micros() + floor(1.8/(3*6* (uint16_t)rpm)*1000000);

        result *= one_step_X( TabRotX[indTabrot] );
        result *= one_step_Y( TabRotY[indTabrot] );

        indTabrot = (indTabrot+1)%LEN_TAB_ROT;
      }
      break;

    default:
      break;
  }

  return result;
}


uint8_t Move_plate::initPos(uint8_t unused){
  digitalWrite(DIR_PIN_X,LOW);
  if( digitalRead(POS_SENSOR_PIN_X) == HIGH ){
    digitalWrite(STEP_PIN_X, HIGH);
    delayMicroseconds(50);
    digitalWrite(STEP_PIN_X, LOW);
    delayMicroseconds(50);
  }

  digitalWrite(DIR_PIN_Y,LOW);
  if( digitalRead(POS_SENSOR_PIN_Y) == HIGH){
    digitalWrite(STEP_PIN_Y, HIGH);
    delayMicroseconds(50);
    digitalWrite(STEP_PIN_Y, LOW);
    delayMicroseconds(50);
  }

  if( digitalRead(POS_SENSOR_PIN_X) == LOW && digitalRead(POS_SENSOR_PIN_Y) == LOW ){
    PosX =0;
    PosY =0;
    
    return 2;
  } 

  return 1;
}

uint8_t Move_plate::moveTo_00(uint8_t unused){
  X_order =0;
  Y_order =0;

  return moveTo_order(0);
}


uint8_t Move_plate::moveTo_Well(uint8_t fluoType){
  X_order = POSX_WELL0 - (numWell%8)*DISTWELL;
  Y_order = POSY_WELL0 - (numWell/8)*DISTWELL + fluoType*DISTFLUO;

  return moveTo_order(1);
}


uint8_t Move_plate::moveTo_order(uint8_t unused){
  uint8_t result =1;
  if(PosX > X_order){
    result *= one_step_X(-1);
  }
  else if(PosX < X_order){
    result *= one_step_X(1);
  }

  if(PosY > Y_order){
    result *= one_step_Y(-1);
  }
  else if(PosY < Y_order){
    result *= one_step_Y(1);
  }

  if(PosX==X_order && PosY==Y_order) return 2;  //stop if it is a loop function

  return result;
}


uint8_t Move_plate::one_step_X(uint8_t direction){
  if(direction == 1 && PosX < MAX_X) {
    digitalWrite(DIR_PIN_X, HIGH  );
    PosX+=1;
  }
  else if (direction&0x1f == 0x1f && PosX < MAX_X && PosX != 0){ //-1 coding on 5 bits
    digitalWrite(DIR_PIN_X, LOW);
    PosX+=-1;
  }
  else if(direction==0){
    return 1; //do nothing
  }
  else{
    return 0;
  }

  digitalWrite(STEP_PIN_X, HIGH);
  delayMicroseconds(50);
  digitalWrite(STEP_PIN_X, LOW);
  delayMicroseconds(50);

  return 1;
}


uint8_t Move_plate::one_step_Y(uint8_t direction){
  if (direction == 1 && PosY < MAX_Y) {
    digitalWrite(DIR_PIN_Y, HIGH);
    PosY+=1;
  }
  else if (direction&0x1f == 0x1f && PosY < MAX_Y && PosY != 0){ //-1 coding on 5 bits
    digitalWrite(DIR_PIN_Y, LOW);
    PosY+=-1;
  }
  else if(direction==0){
    return 1; //do nothing
  }
  else{
    return 0;
  }

  digitalWrite(STEP_PIN_Y, HIGH);
  delayMicroseconds(50);
  digitalWrite(STEP_PIN_Y, LOW);
  delayMicroseconds(50);

  return 1;
}



void Move_plate::SetNbArgMeth(){
  nbArgFloat = 0;

  nbArgInt8 = 3;

  nbArgInt16 = 5;

  nbArgInt32 = 1;


  nbMethod = 7;
}

void Move_plate::SetArgMeth_inTab(){
  //Tab Float


  //Tab uint8_t
  Tabi8[0] = &numWell;
  Tabi8[1] = &rpm;
  Tabi8[2] = &RotState;

  //Tab uint16_t
  Tabi16[0] = &PosX;
  Tabi16[1] = &PosY;
  Tabi16[2] = &X_order;
  Tabi16[3] = &Y_order;
  Tabi16[4] = &indTabrot;

  //Tab uint32_t
  Tabi32[0] = &microS_time;


  //Tab Method
  TabMeth[0] = (OperatingClass::ptrf) &Move_plate::initPos;
  TabMeth[1] = (OperatingClass::ptrf) &Move_plate::rotation;
  TabMeth[2] = (OperatingClass::ptrf) &Move_plate::moveTo_order;
  TabMeth[3] = (OperatingClass::ptrf) &Move_plate::moveTo_Well;
  TabMeth[4] = (OperatingClass::ptrf) &Move_plate::moveTo_00;
  TabMeth[5] = (OperatingClass::ptrf) &Move_plate::one_step_X;
  TabMeth[6] = (OperatingClass::ptrf) &Move_plate::one_step_Y;

}
