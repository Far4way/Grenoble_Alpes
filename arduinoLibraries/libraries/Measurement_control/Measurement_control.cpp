
#include "Arduino.h"
#include <FastLED.h>
#include "HermAs.h"
#include "Measurement_control.h"

//declaration des méthodes

/*constructeur initiant les leds et les arguments*/
Measurement_control::Measurement_control() : redWell_0(0), greenWell_0(250), blueWell_0(0), redWell_1(0), greenWell_1(0), blueWell_1(250)
{
  FastLED.addLeds<WS2812, PIN_WLED_0>(LedWell0, NB_LED);
  FastLED.addLeds<WS2812, PIN_WLED_1>(LedWell1, NB_LED);
}


void Measurement_control::Setup(){

}


uint8_t Measurement_control::RGB_well(uint8_t numWell){
  if(numWell==0){
    for(uint8_t i=0; i<NB_LED; i++){
      LedWell0[i].setRGB( greenWell_0, redWell_0, blueWell_0);
    }
    FastLED.show();
    return 1;
  }
  else if( numWell == 1){
    for(uint8_t i=0; i<NB_LED; i++){
      LedWell1[i].setRGB( greenWell_1, redWell_1, blueWell_1);
    }
    FastLED.show();
    return 1;
  }
  else{
    for(uint8_t i=0; i<NB_LED; i++){
      LedWell0[i].setRGB( greenWell_0, redWell_0, blueWell_0);
      LedWell1[i].setRGB( greenWell_1, redWell_1, blueWell_1);
    }
    FastLED.show();
    return 1;
  }
}


/*etteint toutes les leds*/
uint8_t Measurement_control::Black_well(uint8_t numWell){
  if(numWell==0){
    for(uint8_t i=0; i<NB_LED; i++){
      LedWell0[i] = CRGB::Black;
    }
    FastLED.show();
    return 1;
  } else if(numWell==1){
    for(uint8_t i=0; i<NB_LED; i++){
      LedWell1[i] = CRGB::Black;
    }
    FastLED.show();
    return 1;
  }else{
    for(uint8_t i=0; i<NB_LED; i++){
      LedWell0[i] = CRGB::Black;
      LedWell1[i] = CRGB::Black;
    }
    FastLED.show();
    return 1;
  }
}



void Measurement_control::SetNbArgMeth(){
	nbArgFloat = 0;

	nbArgInt8 = 6;

	nbArgInt16 = 0;

	nbArgInt32 = 0;


	nbMethod = 2;
}

void Measurement_control::SetArgMeth_inTab(){

	//uint8_t
	Tabi8[0] = &redWell_0;
	Tabi8[1] = &greenWell_0;
  Tabi8[2] = &blueWell_0;
	Tabi8[3] = &redWell_1;
  Tabi8[4] = &greenWell_1;
	Tabi8[5] = &blueWell_1;

	TabMeth[0] = (OperatingClass::ptrf) &Measurement_control::RGB_well;
	TabMeth[1] = (OperatingClass::ptrf) &Measurement_control::Black_well;
}
