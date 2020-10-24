
#include "Arduino.h"
#include <FastLED.h>
#include "Hermes.h"
#include "MatLed_adapted.h"

//declaration des méthodes

/*constructeur initiant les leds et les arguments*/
MatLed_adapted::MatLed_adapted() : pin(PIN_MATLED), nbLedx(NB_LED_X), nbLedy(NB_LED_Y), red_default(0), green_default(0), blue_default(0), posX(0), posY(0)
{
  FastLED.addLeds<WS2812, PIN_MATLED>(Tableds, NB_LED_X*NB_LED_Y);
}

/*destructeur realisant rien*/
MatLed_adapted::~MatLed_adapted(){
  //delete[] Tableds; non allouer dynamiquement
}

/*affiche les leds dans l etat demande*/
uint8_t MatLed_adapted::show(uint8_t notuse){
  FastLED.show();
  return 1;
}


/*allumer 1 led en position (posX;posY), en RGB par default
retourne 0 si echec, 1 si réussite*/
uint8_t MatLed_adapted::RGB_1Led(uint8_t notuse){
  uint8_t numLed = coord_to_num(posX, posY);
  if(numLed != -1){
    Tableds[numLed].setRGB( green_default, red_default, blue_default);
    FastLED.show();
    return 1;
  }
  FastLED.show();
  return 0;
}

/*etteind 1 led en position (posX;posY)
retourne 0 si echec, 1 si réussite*/
uint8_t MatLed_adapted::Black_1Led(uint8_t notuse){
  uint8_t numLed = coord_to_num(posX, posY);
  if(numLed != -1){
    Tableds[numLed] = CRGB::Black;
    FastLED.show();
    return 1;
  }
  FastLED.show();
  return 0;
}


/*allumer 1 ligne de leds en position (posY), en RGB par default
retourne 0 si echec, 1 si réussite*/
uint8_t MatLed_adapted::RGB_ligne(uint8_t notuse){
  if(posY>=0 && posY<nbLedy){
    for(uint8_t i=0; i<nbLedx; i++){
      Tableds[i+posY*nbLedx].setRGB( green_default, red_default, blue_default);
    }
    FastLED.show();
    return 1;
  }
  FastLED.show();
  return 0;
}

/*etteind 1 ligne de leds en position (posY)
retourne 0 si echec, 1 si réussite*/
uint8_t MatLed_adapted::Black_ligne(uint8_t notuse){
  if(posY>=0 && posY<nbLedy){
    for(uint8_t i=0; i<nbLedx; i++){
      Tableds[i+posY*nbLedx] = CRGB::Black;
    }
    FastLED.show();
    return 1;
  }
  FastLED.show();
  return 0;
}


/*allumer 1 colonne de leds, en position (posX), en RGB par default
retourne 0 si echec, 1 si réussite*/
uint8_t MatLed_adapted::RGB_column(uint8_t notuse){
  if(nbLedx>=0 && posX<nbLedx){
    for(uint8_t  i=0; i<nbLedy; i++){
      if(i%2==0) Tableds[posX+i*nbLedx].setRGB( green_default, red_default, blue_default);
      if(i%2==1) Tableds[nbLedx-posX-1+i*nbLedx].setRGB( green_default, red_default, blue_default);
    }
    FastLED.show();
    return 1;
  }
  FastLED.show();
  return 0;
}

/*etteind 1 colonne de leds, en position (posX)
retourne 0 si echec, 1 si réussite*/
uint8_t MatLed_adapted::Black_column(uint8_t notuse){
  if(posX>=0 && posX<nbLedx){
    for(uint8_t i=0; i<nbLedy; i++){
      if(i%2==0) Tableds[posX+i*nbLedx] = CRGB::Black;
      if(i%2==1) Tableds[nbLedx-posX-1+i*nbLedx] = CRGB::Black;
    }
    FastLED.show();
    return 1;
  }
  FastLED.show();
  return 0;
}

/*allume toutes les leds, en RGB par defaulte*/
uint8_t MatLed_adapted::RGB_all(uint8_t notuse){
  for(uint8_t i=0; i<nbLedy*nbLedx; i++){
    Tableds[i].setRGB( green_default, red_default, blue_default);
  }
  FastLED.show();
  return 1;
}

/*etteint toutes les leds*/
uint8_t MatLed_adapted::Black_all(uint8_t notuse){
  for(uint8_t i=0; i<nbLedy*nbLedx; i++){
    Tableds[i] = CRGB::Black;
  }
  FastLED.show();
  return 1;
}


/*fixe la couleur par default pour obtenir la couleur de l arc en ciel correspondant au numero*/
uint8_t MatLed_adapted::coord_to_num(uint8_t posX, uint8_t posY){
  if(posX>=0 && posX<nbLedx && posY>=0 && posY<nbLedy){
    if(posY%2==0) return posX+posY*nbLedx;
    if(posY%2==1) return nbLedx-posX-1+posY*nbLedx;
  }
  return -1;
}


void MatLed_adapted::SetNbArgMeth(){
	nbArgFloat = 0;

	nbArgInt8 = 8;
	
	nbArgInt16 = 0;
	
	nbArgInt32 = 0;
	
	
	nbMethod = 9;	
}

void MatLed_adapted::SetArgMeth_inTab(){

	//uint8_t
	Tabi8[0] = &pin;
	Tabi8[1] = &nbLedx;
  Tabi8[2] = &nbLedy;
	Tabi8[3] = &posX;
  Tabi8[4] = &posY;
	Tabi8[5] = &red_default;
  Tabi8[6] = &green_default;
	Tabi8[7] = &blue_default;
	
	
	TabMeth[0] = (OperatingClass::ptrf) &MatLed_adapted::show;
	TabMeth[1] = (OperatingClass::ptrf) &MatLed_adapted::RGB_1Led;
	TabMeth[2] = (OperatingClass::ptrf) &MatLed_adapted::Black_1Led;
	TabMeth[3] = (OperatingClass::ptrf) &MatLed_adapted::RGB_ligne;
	TabMeth[4] = (OperatingClass::ptrf) &MatLed_adapted::Black_ligne;
	TabMeth[5] = (OperatingClass::ptrf) &MatLed_adapted::RGB_column;
	TabMeth[6] = (OperatingClass::ptrf) &MatLed_adapted::Black_column;
	TabMeth[7] = (OperatingClass::ptrf) &MatLed_adapted::RGB_all;
	TabMeth[8] = (OperatingClass::ptrf) &MatLed_adapted::Black_all;
}

void MatLed_adapted::Setup(){

}