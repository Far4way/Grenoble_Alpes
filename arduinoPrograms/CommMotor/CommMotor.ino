#include <Hermes.h>
#include <Move_plate_adapted.h>


Move_plate_adapted Mot;
Hermes herm(0b001,Mot);

void setup() {
  herm.setup_OpClass();
}


void loop() {

    if(herm.readMg()){
      herm.interpretMg(); 
    }
    herm.Exec_inWL();    
  
}
