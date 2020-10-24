#ifndef Measurement_Control_h
#define Measurement_Control_h
#include "Arduino.h"
#include <FastLED.h>


#define PIN_WLED_0 4
#define PIN_WLED_1 5

#define NB_LED 4


class Measurement_control : public OperatingClass{
  //declaration des prototypes

public:
  /*constructeur initiant les leds et les arguments*/
  Measurement_control();

  uint8_t RGB_well(uint8_t numWell);

  uint8_t Black_well(uint8_t numWell);

private:

	void SetNbArgMeth();

	void SetArgMeth_inTab();

  void Setup();

  //declaration des arguments
  uint8_t redWell_0;
  uint8_t greenWell_0;
  uint8_t blueWell_0;
  uint8_t redWell_1;
  uint8_t greenWell_1;
  uint8_t blueWell_1;
  CRGB LedWell0[NB_LED];     //Leds array 0
  CRGB LedWell1[NB_LED];     //Leds array 1
};

#endif
