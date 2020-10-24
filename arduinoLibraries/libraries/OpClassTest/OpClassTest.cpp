#include "Arduino.h"
#include "Hermes.h"
#include "OpClassTest.h"

OpClassTest::OpClassTest(uint8_t arg) : argI8_0(arg){
	argI8_1 = 67;
	
	argI16 = 11;
	
	argI32 = 500;
	
	argF = 30.5301;
}

uint8_t OpClassTest::addArg(uint8_t arg){
	argI8_0 += arg;
	argI8_1 += arg;
	argI16 += arg;
	argI32 += arg;
	argF += arg/10.0;
	return 1;
}

void OpClassTest::SetNbArgMeth(){
	nbArgFloat = 1;

	nbArgInt8 = 2;
	
	nbArgInt16 = 1;
	
	nbArgInt32 = 1;
	
	
	nbMethod = 1;	
}

void OpClassTest::SetArgMeth_inTab(){

	Tabfloat[0] = &argF;

	//uint8_t
	Tabi8[0] = &argI8_0;
	Tabi8[1] = &argI8_1;
	
	Tabi16[0] = &argI16;
	
	Tabi32[0] = &argI32;
	
	
	
	TabMeth[0] = (OperatingClass::ptrf) &OpClassTest::addArg;
}

