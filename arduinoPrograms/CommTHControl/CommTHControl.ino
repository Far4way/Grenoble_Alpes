#include <Hermes.h>
#include <THcontrol.h>



THcontrol THC(50.0,0.01,10.0);
Hermes herm(0b001,THC);
   
void setup() {
  herm.setup_OpClass();

}


void loop() {

    if(herm.readMg()){
      herm.interpretMg(); 
    }
    herm.Exec_inWL();    
  
}
