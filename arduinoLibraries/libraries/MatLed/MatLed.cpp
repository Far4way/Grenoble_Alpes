#include "Arduino.h"
#include <FastLED.h>
#include "MatLed.h"

//declaration des méthodes
/*constructeur initiant les leds et les arguments*/
MatLed::MatLed() : pin(PIN_MATLED), nbLedx(NB_LED_X), nbLedy(NB_LED_Y), red_default(0), green_default(0), blue_default(0)
{
  FastLED.addLeds<WS2812, PIN_MATLED>(Tableds, NB_LED_X*NB_LED_Y);
}

/*destructeur realisant rien*/
MatLed::~MatLed(){
  //delete[] Tableds; non allouer dynamiquement
}

/*affiche les leds dans l etat demande*/
void MatLed::show(){
  FastLED.show();
}

/*allumer 1 led en position (posX;posY), en RGB
retourne 0 si echec, 1 si réussite*/
uint8_t MatLed::RGB_1Led(uint8_t posX, uint8_t posY, uint8_t red, uint8_t green, uint8_t blue){
  uint8_t numLed = coord_to_num(posX, posY);
  if(numLed != -1){
    Tableds[numLed].setRGB( green, red, blue);
    return 1;
  }
  return 0;
}

/*allumer 1 led en position (posX;posY), en RGB par default
retourne 0 si echec, 1 si réussite*/
uint8_t MatLed::RGB_1Led(uint8_t posX, uint8_t posY){
  uint8_t numLed = coord_to_num(posX, posY);
  if(numLed != -1){
    Tableds[numLed].setRGB( green_default, red_default, blue_default);
    return 1;
  }
  return 0;
}

/*etteind 1 led en position (posX;posY)
retourne 0 si echec, 1 si réussite*/
uint8_t MatLed::Black_1Led(uint8_t posX, uint8_t posY){
  uint8_t numLed = coord_to_num(posX, posY);
  if(numLed != -1){
    Tableds[numLed] = CRGB::Black;
    return 1;
  }
  return 0;
}


/*allumer 1 ligne de leds en position (posY), en RGB
retourne 0 si echec, 1 si réussite*/
uint8_t MatLed::RGB_ligne(uint8_t posY, uint8_t red, uint8_t green, uint8_t blue){
  if(posY>=0 && posY<nbLedy){
    for(uint8_t i=0; i<nbLedx; i++){
      Tableds[i+posY*nbLedx].setRGB( green, red, blue);
    }
    return 1;
  }
  return 0;
}

/*allumer 1 ligne de leds en position (posY), en RGB par default
retourne 0 si echec, 1 si réussite*/
uint8_t MatLed::RGB_ligne(uint8_t posY){
  if(posY>=0 && posY<nbLedy){
    for(uint8_t i=0; i<nbLedx; i++){
      Tableds[i+posY*nbLedx].setRGB( green_default, red_default, blue_default);
    }
    return 1;
  }
  return 0;
}

/*etteind 1 ligne de leds en position (posY)
retourne 0 si echec, 1 si réussite*/
uint8_t MatLed::Black_ligne(uint8_t posY){
  if(posY>=0 && posY<nbLedy){
    for(uint8_t i=0; i<nbLedx; i++){
      Tableds[i+posY*nbLedx] = CRGB::Black;
    }
    return 1;
  }
  return 0;
}

/*allumer 1 colonne de leds, en position (posX), en RGB
retourne 0 si echec, 1 si réussite*/
uint8_t MatLed::RGB_column(uint8_t posX, uint8_t red, uint8_t green, uint8_t blue){
  if(nbLedx>=0 && posX<nbLedx){
    for(uint8_t  i=0; i<nbLedy; i++){
      if(i%2==0) Tableds[posX+i*nbLedx].setRGB( green, red, blue);
      if(i%2==1) Tableds[nbLedx-posX-1+i*nbLedx].setRGB( green, red, blue);
    }
    return 1;
  }
  return 0;
}

/*allumer 1 colonne de leds, en position (posX), en RGB par default
retourne 0 si echec, 1 si réussite*/
uint8_t MatLed::RGB_column(uint8_t posX){
  if(nbLedx>=0 && posX<nbLedx){
    for(uint8_t  i=0; i<nbLedy; i++){
      if(i%2==0) Tableds[posX+i*nbLedx].setRGB( green_default, red_default, blue_default);
      if(i%2==1) Tableds[nbLedx-posX-1+i*nbLedx].setRGB( green_default, red_default, blue_default);
    }
    return 1;
  }
  return 0;
}

/*etteind 1 colonne de leds, en position (posX)
retourne 0 si echec, 1 si réussite*/
uint8_t MatLed::Black_column(uint8_t posX){
  if(posX>=0 && posX<nbLedx){
    for(uint8_t i=0; i<nbLedy; i++){
      if(i%2==0) Tableds[posX+i*nbLedx] = CRGB::Black;
      if(i%2==1) Tableds[nbLedx-posX-1+i*nbLedx] = CRGB::Black;
    }
    return 1;
  }
  return 0;
}

/*allume toutes les leds, en RGB*/
void MatLed::RGB_all(uint8_t red, uint8_t green, uint8_t blue){
  for(uint8_t i=0; i<nbLedy*nbLedx; i++){
    Tableds[i].setRGB( green, red, blue);
  }
}

/*allume toutes les leds, en RGB par defaulte*/
void MatLed::RGB_all(){
  for(uint8_t i=0; i<nbLedy*nbLedx; i++){
    Tableds[i].setRGB( green_default, red_default, blue_default);
  }
}

/*etteint toutes les leds*/
void MatLed::Black_all(){
  for(uint8_t i=0; i<nbLedy*nbLedx; i++){
    Tableds[i] = CRGB::Black;
  }
}

/*fixe la couleurs RGB par default*/
void MatLed::Set_RGB_default(uint8_t red, uint8_t green, uint8_t blue){
  red_default=red;
  green_default=green;
  blue_default=blue;
}

/*affiche iGEM avec la couleur par default*/
void MatLed::iGEM(){

  /*'i'*/
  RGB_1Led(0,1);
  RGB_1Led(0,3);
  RGB_1Led(0,4);

  /*'G'*/
  RGB_1Led(2,0);
  RGB_1Led(3,0);
  RGB_1Led(4,0);
  RGB_1Led(2,1);
  RGB_1Led(2,2);
  RGB_1Led(2,3);
  RGB_1Led(2,4);
  RGB_1Led(3,4);
  RGB_1Led(4,4);
  RGB_1Led(5,4);
  RGB_1Led(5,3);
  RGB_1Led(5,2);
  RGB_1Led(4,2);

  /*'E'*/
  RGB_1Led(7,0);
  RGB_1Led(8,0);
  RGB_1Led(9,0);
  RGB_1Led(7,1);
  RGB_1Led(7,2);
  RGB_1Led(8,2);
  RGB_1Led(7,3);
  RGB_1Led(7,4);
  RGB_1Led(8,4);
  RGB_1Led(9,4);

  /*'M'*/
  RGB_1Led(11,0);
  RGB_1Led(12,1);
  RGB_1Led(13,2);
  RGB_1Led(14,1);
  RGB_1Led(15,0);
  RGB_1Led(11,1);
  RGB_1Led(11,2);
  RGB_1Led(11,3);
  RGB_1Led(11,4);
  RGB_1Led(15,1);
  RGB_1Led(15,2);
  RGB_1Led(15,3);
  RGB_1Led(15,4);

}

/*affiche iGEM en arc en ciel, avec un possible offset*/
void MatLed::iGEM_ArcEnCiel(uint8_t offset, uint8_t max){

  /*'i'*/
  arcEnciel_offset((0+offset)%37, max);
  RGB_1Led(0,1);
  arcEnciel_offset((2+offset)%37, max);
  RGB_1Led(0,3);
  arcEnciel_offset((2+offset)%37, max);
  RGB_1Led(0,4);

  /*'G'*/
  arcEnciel_offset((1+offset)%37, max);
  RGB_1Led(2,0);
  arcEnciel_offset((2+offset)%37, max);
  RGB_1Led(3,0);
  arcEnciel_offset((3+offset)%37, max);
  RGB_1Led(4,0);
  arcEnciel_offset((2+offset)%37, max);
  RGB_1Led(2,1);
  arcEnciel_offset((3+offset)%37, max);
  RGB_1Led(2,2);
  arcEnciel_offset((4+offset)%37, max);
  RGB_1Led(2,3);
  arcEnciel_offset((5+offset)%37, max);
  RGB_1Led(2,4);
  arcEnciel_offset((6+offset)%37, max);
  RGB_1Led(3,4);
  arcEnciel_offset((7+offset)%37, max);
  RGB_1Led(4,4);
  arcEnciel_offset((8+offset)%37, max);
  RGB_1Led(5,4);
  arcEnciel_offset((7+offset)%37, max);
  RGB_1Led(5,3);
  arcEnciel_offset((6+offset)%37, max);
  RGB_1Led(5,2);
  arcEnciel_offset((5+offset)%37, max);
  RGB_1Led(4,2);

  /*'E'*/
  arcEnciel_offset((6+offset)%37, max);
  RGB_1Led(7,0);
  arcEnciel_offset((7+offset)%37, max);
  RGB_1Led(8,0);
  arcEnciel_offset((8+offset)%37, max);
  RGB_1Led(9,0);
  arcEnciel_offset((7+offset)%37, max);
  RGB_1Led(7,1);
  arcEnciel_offset((8+offset)%37, max);
  RGB_1Led(7,2);
  arcEnciel_offset((9+offset)%37, max);
  RGB_1Led(8,2);
  arcEnciel_offset((9+offset)%37, max);
  RGB_1Led(7,3);
  arcEnciel_offset((10+offset)%37, max);
  RGB_1Led(7,4);
  arcEnciel_offset((11+offset)%37, max);
  RGB_1Led(8,4);
  arcEnciel_offset((12+offset)%37, max);
  RGB_1Led(9,4);

  /*'M'*/
  arcEnciel_offset((10+offset)%37, max);
  RGB_1Led(11,0);
  arcEnciel_offset((11+offset)%37, max);
  RGB_1Led(12,1);
  arcEnciel_offset((14+offset)%37, max);
  RGB_1Led(13,2);
  arcEnciel_offset((14+offset)%37, max);
  RGB_1Led(14,1);
  arcEnciel_offset((14+offset)%37, max);
  RGB_1Led(15,0);
  arcEnciel_offset((11+offset)%37, max);
  RGB_1Led(11,1);
  arcEnciel_offset((12+offset)%37, max);
  RGB_1Led(11,2);
  arcEnciel_offset((13+offset)%37, max);
  RGB_1Led(11,3);
  arcEnciel_offset((14+offset)%37, max);
  RGB_1Led(11,4);
  arcEnciel_offset((15+offset)%37, max);
  RGB_1Led(15,1);
  arcEnciel_offset((16+offset)%37, max);
  RGB_1Led(15,2);
  arcEnciel_offset((17+offset)%37, max);
  RGB_1Led(15,3);
  arcEnciel_offset((18+offset)%37, max);
  RGB_1Led(15,4);
}

/*convertie les coordonnees au numero de la led
retourne le numero de la led, ou -1 si erreur*/
void MatLed::arcEnciel_offset(uint8_t num, uint8_t max){
  if(num<=18){
    red_default = max*(18-num)/18.0;
    blue_default = max*num/18.0;
    if(num <= 18/2) green_default = max*num*2/18.0;
    if(num > 18/2) green_default = max*(18-num)*2/18.0;
  }
  else{
    blue_default = max*(36-num)/18.0;
    red_default = max*(num-18)/18.0;
    if(num-18 <= 18/2) green_default = max*(num-18)*2/18.0;
    if(num-18 > 18/2) green_default = max*(36-num)*2/18.0;
  }
}

/*fixe la couleur par default pour obtenir la couleur de l arc en ciel correspondant au numero*/
uint8_t MatLed::coord_to_num(uint8_t posX, uint8_t posY){
  if(posX>=0 && posX<nbLedx && posY>=0 && posY<nbLedy){
    if(posY%2==0) return posX+posY*nbLedx;
    if(posY%2==1) return nbLedx-posX-1+posY*nbLedx;
  }
  return -1;
}
