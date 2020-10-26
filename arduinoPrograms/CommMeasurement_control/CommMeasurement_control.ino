#include <HermAs.h>
#include <Measurement_control.h>

Measurement_control Mc;
HermAs herm(0b011,Mc);
   
void setup() {
  herm.setup_OpClass();

}


void loop() {

    if(herm.readMg()){
      herm.interpretMg(); 
    }
    herm.Exec_inWL();    
  
}
