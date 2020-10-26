
#ifndef Hermes_h
#define Hermes_h

#define NBMAXWL 20


typedef struct _m{ uint32_t body:24, Ttype:3, type:2, idArd:3;}M;

typedef union
{
  char b[4];
  uint32_t i;
  M m;
} Mg;

typedef struct _wlFct{
	uint32_t lpTime:10, unitlTime:2, loop:1, arg:5, numFct:6;
	unsigned long TofExec;
}WlFct;


class OperatingClass{

	friend class Hermes;

private:

	virtual void SetNbArgMeth() =0;
	
	virtual void SetArgMeth_inTab() =0;
	
	virtual void Setup();

public:

	//number of each type
	uint8_t nbArgInt8;
	uint8_t nbArgInt16;
	uint8_t nbArgInt32;
	uint8_t nbArgFloat;
	
	uint8_t nbMethod;
	
	//pointer on the argument
	uint8_t** Tabi8;
	uint16_t** Tabi16;
	uint32_t** Tabi32;
	float** Tabfloat;
	
	//ptr on the methods
	typedef uint8_t (OperatingClass::* ptrf) (uint8_t);
	ptrf* TabMeth;
};



class Hermes{

public:
	/*prototype des methodes*/
	
	//constructor
	Hermes(uint8_t arg_id, OperatingClass& arg_opClass);


	void setup_OpClass();

	uint8_t allocationTab();

	//reception d un message
	uint8_t readMg();

	//envoi d un message
	void sendMg();
	
	void sendMg(uint32_t body, uint8_t typeMg = 0x01);
	
	void sendAck( uint8_t Tack, uint8_t ack, uint16_t data = 0);
	
	uint8_t sendInfo(uint8_t Tinf, uint8_t numArg1 = 0xff, uint8_t numArg2 = 0xff);

	uint8_t setArg(uint8_t num, uint16_t val=0);

	
	uint8_t interpretMg();


	uint8_t addinWL();

	uint8_t RMinWL(uint8_t numfct, uint8_t ind=0xff);


	uint8_t resendMg();
	
	uint32_t Time12b_to_32b(uint8_t unit, uint16_t valTime);

	uint8_t Time32b_to_12bUnit( uint32_t valTms);
	
	uint16_t Time32b_to_12bVal( uint32_t valTms);

	uint8_t Exec_inWL();


private:

	Mg mg;

	uint8_t id;
	
	OperatingClass& OpClass;

	WlFct WaitingList[NBMAXWL];

	uint8_t nbfctWL;

};


#endif
