#include <HermAs.h>
#include <OpClassTest.h>

OpClassTest opcT(42);
HermAs herm(0b001,opcT);


void setup() {
  herm.setup_OpClass();
}


void loop() {

    if(herm.readMg()){
      herm.interpretMg(); 
    }
    herm.Exec_inWL();    
  
}
