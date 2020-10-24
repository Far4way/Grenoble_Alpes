#include <Hermes.h>
#include <MatLed_adapted.h>



MatLed_adapted MT;
Hermes herm(0b010,MT);
   
void setup() {
  herm.setup_OpClass();

}


void loop() {

    if(herm.readMg()){
      herm.interpretMg(); 
    }
    herm.Exec_inWL();    
  
}
