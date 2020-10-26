#include <Hermes.h>
#include <MatLed.h>



MatLed MT;
Hermes herm(0b001,MT);
   
void setup() {
  herm.setup_OpClass();

}


void loop() {

    if(herm.readMg()){
      herm.interpretMg(); 
    }
    herm.Exec_inWL();    
  
}
