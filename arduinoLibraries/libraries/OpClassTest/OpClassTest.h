
#ifndef OpClassTest_h
#define OpClassTest_h

class OpClassTest : public OperatingClass{

public:
	OpClassTest(uint8_t arg);

	uint8_t addArg(uint8_t arg);


private:
	void SetNbArgMeth();
	
	void SetArgMeth_inTab();
	
	
	uint8_t argI8_0;
	uint8_t argI8_1;
	uint16_t argI16;
	uint32_t argI32;
	float argF;
	
	//pf p = (OperatingClass::pf) &OpClassTest::setArg1;
//	uint8_t (*TabMeth[])(uint8_t) = {&OpClassTest::setArg1};

};



#endif
