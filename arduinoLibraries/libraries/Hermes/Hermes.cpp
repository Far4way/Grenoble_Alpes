#include "Arduino.h"
#include "Hermes.h"


/*void OperatingClass::Setup(){
zeus stp
}*/


/*declaration des methodes de Hermes*/

//constructeur
Hermes::Hermes(uint8_t arg_id, OperatingClass& arg_opClass): id(arg_id&0x07), OpClass(arg_opClass), nbfctWL(0) {
	mg.i = 0;
}


void Hermes::setup_OpClass(){
	Serial.begin(19200);

	OpClass.Setup();

	OpClass.SetNbArgMeth();
	if( this->allocationTab())	OpClass.SetArgMeth_inTab();
	delay(1500);
	sendAck(0b000,0b000);
}


uint8_t Hermes::allocationTab(){
	//allocation dynamique des pointeurs
	
	if( OpClass.nbArgFloat > 32){
		sendAck(0b010,0b000,0b000);
		return 0;
	}
	if( OpClass.nbArgInt8 > 32){
		sendAck(0b010,0b000,0b001);
		return 0;
	}
	if( OpClass.nbArgInt16 > 32){
		sendAck(0b010,0b000,0b010);
		return 0;
	}
	if( OpClass.nbArgInt32 > 8){
		sendAck(0b010,0b000,0b011);
		return 0;
	}

	if( OpClass.nbArgInt8 + OpClass.nbArgInt16 + OpClass.nbArgInt32 + OpClass.nbArgFloat > 64){
		sendAck(0b010,0b000,0b101);
		return 0;
	}

	if( OpClass.nbMethod > 64){
		sendAck(0b010,0b000,0b100);
		return 0;
	}
	

	OpClass.Tabi8 =(uint8_t **) malloc( OpClass.nbArgInt8 * sizeof(uint8_t*) );
	
	OpClass.Tabi16 =(uint16_t **) malloc( OpClass.nbArgInt16 * sizeof(uint16_t*) );
	
	OpClass.Tabi32 =(uint32_t **) malloc( OpClass.nbArgInt32 * sizeof(uint32_t*) );
	
	OpClass.Tabfloat =(float **) malloc( OpClass.nbArgFloat * sizeof(float*) );
	
	
	OpClass.TabMeth = (OperatingClass::ptrf*) malloc( OpClass.nbMethod * sizeof( OperatingClass::ptrf ) );

	return 1;
}

uint8_t Hermes::readMg(){
	if( Serial.available() > 0 ){

		uint8_t i;
		for(i=0;i<4;i++){
			mg.b[3-i] = Serial.read();
			delay(3);
		}
		Serial.flush();
		
		//verification du destinataire
		
		if(mg.m.idArd == this->id){
			return 1;
		}else{
			this->sendAck( 0b001, 0b000, mg.m.idArd);
			return 0;
		}
		
	}
	return 0;
}



void Hermes::sendMg(){
	mg.m.idArd = id;
	uint8_t i;
	for(i=0;i<4;i++) Serial.write( mg.b[3-i]);
	//Serial.write('\n'); 
	Serial.flush();
}

void Hermes::sendMg(uint32_t body, uint8_t typeMg){
	uint32_t tempo = mg.i;
	mg.m.type = typeMg&0x03;
	mg.m.body = body&0x00ffffff;
	this->sendMg();
	mg.i = tempo;
}

void Hermes::sendAck( uint8_t Tack, uint8_t ack, uint16_t data){
	uint8_t tempo = mg.i;
	mg.m.type = 0b00;
	mg.m.Ttype = Tack;
	mg.m.body = (((uint32_t)ack&0x07)<<21) + data;
	this->sendMg();
	mg.i = tempo;
}

uint8_t Hermes::sendInfo( uint8_t Tinf, uint8_t numArg1, uint8_t numArg2){
	uint32_t tempo = mg.i;
	uint8_t res =0;

	switch(Tinf){
		case 0b000:		//give 1 argument
			if(numArg1 >= OpClass.nbArgInt8 + OpClass.nbArgInt16 + OpClass.nbArgInt32 + OpClass.nbArgFloat){
				this->sendAck( 0b001, 0b010, numArg1);	//err interpret: num arg no exist
				return 0;
			}
			
			mg.m.type = 0b11;	//message type=info
			mg.m.Ttype = 0b000; //Tinf = 1 arg
			if(numArg1<OpClass.nbArgFloat){
				uint16_t val = (uint16_t) (*this->OpClass.Tabfloat[numArg1] *100);
				mg.m.body = (((uint32_t)numArg1&0x3f)<<18) + ((uint32_t)0b00<<16) + val;
				this->sendMg();
			}
			else if(numArg1>=OpClass.nbArgFloat && numArg1< OpClass.nbArgFloat + OpClass.nbArgInt8){
				uint8_t val = *this->OpClass.Tabi8[numArg1-OpClass.nbArgFloat];
				mg.m.body = (((uint32_t)numArg1&0x3f)<<18) + ((uint32_t)0b01<<16) + val;
				this->sendMg();
			}
			else if(numArg1>=OpClass.nbArgFloat + OpClass.nbArgInt8  && numArg1< OpClass.nbArgFloat + OpClass.nbArgInt8 + OpClass.nbArgInt16){
				uint16_t val = *this->OpClass.Tabi16[numArg1 - (OpClass.nbArgFloat + OpClass.nbArgInt8)];
				mg.m.body = (((uint32_t)numArg1&0x3f)<<18) + ((uint32_t)0b10<<16) + val;
				this->sendMg();
			}
			else if(numArg1>=OpClass.nbArgFloat + OpClass.nbArgInt8 + OpClass.nbArgInt16 && numArg1< OpClass.nbArgFloat + OpClass.nbArgInt8 + OpClass.nbArgInt16 +  OpClass.nbArgInt32){
				uint32_t val = *this->OpClass.Tabi32[numArg1 - (OpClass.nbArgFloat + OpClass.nbArgInt8 +  OpClass.nbArgInt16)];
				mg.m.body = (((uint32_t)numArg1&0x3f)<<18) + ((uint32_t)0b11<<16) + ((val&0xffff0000)>>16);
				this->sendMg();
				mg.m.body = (((uint32_t)numArg1&0x3f)<<18) + ((uint32_t)0b11<<16) + (val&0x0000ffff);
				this->sendMg();
			}
			else{
				this->sendAck( 0b01, 0b010, numArg1);	//err interpret: num arg no exist
				return 0;
			}
			
			mg.i = tempo;
			return 1;
			break;
		
		case 0b001:		//give 2 arguments

			
			if(numArg2 == 0xff) numArg2 = numArg1 +1;
			
			//verification if the 2 arguments are uint8_t, and numArg1 next to numArg2
			if(numArg1>=OpClass.nbArgFloat && numArg1< OpClass.nbArgFloat + OpClass.nbArgInt8 && numArg2>=OpClass.nbArgFloat && numArg2< OpClass.nbArgFloat + OpClass.nbArgInt8){
				if(numArg2-numArg1 == 1){	//arg1 first
					mg.m.type = 0b11;	//message type=info
					mg.m.Ttype = 0b001; //Tinf = 2 arg
					uint8_t val1 = *this->OpClass.Tabi8[numArg1-OpClass.nbArgFloat];
					uint8_t val2 = *this->OpClass.Tabi8[numArg2-OpClass.nbArgFloat];
					mg.m.body = (((uint32_t)numArg1&0x3f)<<18) + ((uint32_t)0b01<<16) + ((uint32_t)val1<<8) + val2;
					this->sendMg();
					mg.i = tempo;
					return 1;
				}
				else if(numArg1-numArg2 == 1){	//arg2 first
					mg.m.type = 0b11;	//message type=info
					mg.m.Ttype = 0b001; //Tinf = 2 arg
					uint8_t val1 = *this->OpClass.Tabi8[numArg1-OpClass.nbArgFloat];
					uint8_t val2 = *this->OpClass.Tabi8[numArg2-OpClass.nbArgFloat];
					mg.m.body = (((uint32_t)numArg2&0x3f)<<18) + ((uint32_t)0b01<<16) + ((uint32_t)val2<<8) + val1;
					this->sendMg();
					mg.i = tempo;
					return 1;
				}
			}
			
			//else send 2 message type Tinf=0b000 (1 arg)
			res = sendInfo( 0b000, numArg1);
			return res * sendInfo( 0b000, numArg2);
			
			break;
		
		case 0b010:		//nb arg, nb fonction
			mg.m.type = 0b11;	//message type=info
			mg.m.Ttype = 0b010; //Tinf = 1 arg
			mg.m.body = (((uint32_t)OpClass.nbMethod&0x3f)<<18) + (((uint32_t)OpClass.nbArgFloat&0x1f)<<13) + (((uint16_t)OpClass.nbArgInt8&0x1f)<<8) + (((uint16_t)OpClass.nbArgInt16&0x1f)<<3) + (OpClass.nbArgInt32&0x07);
			this->sendMg();
			mg.i = tempo;
			return 1;

			break;
		
		case 0b011:		//waiting list
			if( nbfctWL == 0) sendAck(0b001,0b101);
			for(uint8_t i=0; i<nbfctWL; i++){
				mg.m.type = 0b11;	//message type=info
				mg.m.Ttype = 0b011; //Tinf = fct waiting list
				if( WaitingList[i].loop ){
					mg.m.body = ((uint32_t)WaitingList[i].numFct<<18) + (((uint32_t)WaitingList[i].arg&0x1f)<<13) + (WaitingList[i].loop<<12) + (WaitingList[i].unitlTime<<10) + (WaitingList[i].lpTime); 
				}else{
					mg.m.body = ((uint32_t)WaitingList[i].numFct<<18) + (((uint32_t)WaitingList[i].arg&0x1f)<<13) + (WaitingList[i].loop<<12) + ((Time32b_to_12bUnit(WaitingList[i].TofExec - millis() )&0x03) <<10) + (Time32b_to_12bVal(WaitingList[i].TofExec - millis())&0x3f);
				}
				this->sendMg();				
			}
			mg.i = tempo;
			return 1;
			break;
		
		default:
		
			break;
	}
	
}

uint8_t Hermes::addinWL(){
	if((uint8_t)(((uint32_t)mg.m.body)>>18) >= OpClass.nbMethod ){
	 	sendAck(0b001,0b011, (mg.m.body>>18)&0x3f);
		return 0;
	}

	if( nbfctWL < NBMAXWL){
		WaitingList[nbfctWL].numFct = (mg.m.body>>18)&0x3f;
		WaitingList[nbfctWL].arg = (mg.m.body>>13)&0x1f;
		WaitingList[nbfctWL].loop = (mg.m.body>>12)&0x01;
		if(WaitingList[nbfctWL].loop){
			WaitingList[nbfctWL].unitlTime = (mg.m.body>>10)&0x03;
			WaitingList[nbfctWL].lpTime = mg.m.body&0x03ff;
			WaitingList[nbfctWL].TofExec = millis() + Time12b_to_32b( WaitingList[nbfctWL].unitlTime , WaitingList[nbfctWL].lpTime);
		}else{
			WaitingList[nbfctWL].TofExec = millis() + Time12b_to_32b( (mg.m.body>>10)&0x03 , mg.m.body&0x03ff);
		}
		nbfctWL++;
		sendAck(0b000,0b100,0b100);
		return 1;
	}
	sendAck(0b001,0b101,nbfctWL);
	return 0;
}

uint8_t Hermes::RMinWL(uint8_t numfct, uint8_t ind){
	if( nbfctWL>0){

		if( ind == 0xff){
			//found the function in the list (array)
			for(uint8_t i=0;i<nbfctWL;i++){
				if(WaitingList[i].numFct == numfct){
					ind =i;
					break;	
				} 
			}
		}

		if( ind != 0xff){
			
			if( ind != nbfctWL-1){
				//switch with the last function in the list
				WlFct wlF;
				wlF.arg = WaitingList[nbfctWL-1].arg;
				wlF.numFct = WaitingList[nbfctWL-1].numFct;
				wlF.TofExec = WaitingList[nbfctWL-1].TofExec;
				wlF.loop = WaitingList[nbfctWL-1].loop;
				wlF.unitlTime = WaitingList[nbfctWL-1].unitlTime;
				wlF.lpTime = WaitingList[nbfctWL-1].lpTime;

				WaitingList[nbfctWL-1].arg = WaitingList[ind].arg;
				WaitingList[nbfctWL-1].numFct = WaitingList[ind].numFct;
				WaitingList[nbfctWL-1].TofExec = WaitingList[ind].TofExec;
				WaitingList[nbfctWL-1].loop = WaitingList[ind].loop;
				WaitingList[nbfctWL-1].unitlTime = WaitingList[ind].unitlTime;
				WaitingList[nbfctWL-1].lpTime = WaitingList[ind].lpTime;

				WaitingList[ind].arg = wlF.arg;
				WaitingList[ind].numFct = wlF.numFct;
				WaitingList[ind].TofExec = wlF.TofExec;
				WaitingList[ind].loop = wlF.loop;
				WaitingList[ind].unitlTime = wlF.unitlTime;
				WaitingList[ind].lpTime = wlF.lpTime;
			}

			//decremente the number of function in the waiting list
			nbfctWL += -1;
			sendAck( 0b000,0b100, 0b110);
			return 1;
		}else{
			sendAck(0b001,0b100,numfct); 	//no in the waiting list
			return 0;
		}
	}
	sendAck(0b001,0b100,numfct); 	//no in the waiting list
	return 0;
}

uint8_t Hermes::setArg(uint8_t num, uint16_t val){
	
	if(num >= OpClass.nbArgInt8 + OpClass.nbArgInt16 + OpClass.nbArgInt32 + OpClass.nbArgFloat){
			this->sendAck( 0b001, 0b010, num);	//err interpret: num arg no exist
			return 0;
		}
		
		
		if(num<OpClass.nbArgFloat){
			*this->OpClass.Tabfloat[num] = ((float)val) / 100.0;
		}
		else if(num>=OpClass.nbArgFloat && num< OpClass.nbArgFloat + OpClass.nbArgInt8){
			*this->OpClass.Tabi8[num-OpClass.nbArgFloat] = (uint8_t)val;
		}
		else if(num>=OpClass.nbArgFloat + OpClass.nbArgInt8  && num< OpClass.nbArgFloat + OpClass.nbArgInt8 + OpClass.nbArgInt16){
			*this->OpClass.Tabi16[num - (OpClass.nbArgFloat + OpClass.nbArgInt8)] = val;
		}
		else if(num>=OpClass.nbArgFloat + OpClass.nbArgInt8 + OpClass.nbArgInt16 && num< OpClass.nbArgFloat + OpClass.nbArgInt8 + OpClass.nbArgInt16 +  OpClass.nbArgInt32){
			*this->OpClass.Tabi32[num - (OpClass.nbArgFloat + OpClass.nbArgInt8 +  OpClass.nbArgInt16)] = (uint32_t)val;
		}
		else{
			this->sendAck( 0b01, 0b010, num);	//err interpret: num arg no exist
			return 0;
		}

		return 1;
}

uint8_t Hermes::interpretMg(){
	uint8_t res = 0;
	switch(mg.m.type){
		case 0b00:	//ack
			if( mg.i == (((uint32_t)id)<<29) ) sendAck(0b000,0b000);

			break;
			
		case 0b01:	//debug
			
			break;
			
		case 0b10:	//request
			
			switch(mg.m.Ttype){	//Trqt
				case 0b000:		// get 1 info;
					
					return sendInfo( (mg.m.body>>21)&0x07 , (mg.m.body>>15)&0x3f );
					break;
				
				case 0b001:		//get 2 info;
					
					if( !(mg.m.body>>21)&0x07 && !(mg.m.body>>18)&0x07){	//same with Trqt=0b000, with a Tinf=0b001
						return sendInfo( 0b001, (mg.m.body>>12)&0x3f , (mg.m.body>>6)&0x3f );
					}
					else{
						res = sendInfo( (mg.m.body>>21)&0x07, (mg.m.body>>12)&0x3f);
						return res * sendInfo( (mg.m.body>>18)&0x07, (mg.m.body>>6)&0x3f);
					}
					
					break;
				
				case 0b010:		//set 1 arg;
					res = setArg( (mg.m.body>>18)&0x3f, mg.m.body&0xffff);
					if(res) sendAck(0b000, 0b100, 0b010); //well executed
					return res;
					break;
				
				case 0b011:		//set 2 arg;
					res = setArg( (mg.m.body>>18)&0x3f, (mg.m.body>>8)&0xff);
					res = res * setArg( 1+ (mg.m.body>>18)&0x3f, mg.m.body&0xff);
					if(res) sendAck(0b000, 0b100, 0b011); //well executed
					return res;
					break;
					
				case 0b100:		//execute 1 fct;
					return addinWL();
					break;
				
				case 0b101:		//re send
					return resendMg();
					break;
				
				case 0b110:		//remove fct from the waiting list
					return RMinWL( (mg.m.body>>18)&0x3f );
					break;
				case 0b111: 	//reset arduino
					asm volatile ("  jmp 0");
					break;
				}
			
			break;
		
		case 0b11:	//information
						
			break;
	
	
	}
}

uint8_t Hermes::resendMg(){
	
	uint32_t fPartMg = mg.m.body&0xffff;
	if( this->readMg() ){

		if( mg.m.type == 0b10 && mg.m.Ttype == 0b101){
			mg.i = (fPartMg<<16) + (mg.m.body&0xffff);
			this->sendMg();
			return 1;
		}else{
			uint32_t tempo = mg.i;
			mg.i = (fPartMg<<16) + 0x0000;
			this->sendMg();
			mg.i = tempo;
			return interpretMg();
		}
	}
	mg.i = fPartMg<<16 + 0x0000;
	this->sendMg();
	return 1;
}

/*PINE TA DARONNE */
/*MAIS GENRE VRAIMENT BIEN, PINE LA EN TAPANT BIEN DANS LE FOND*/
//ouais ouais super

uint32_t Hermes::Time12b_to_32b(uint8_t unit, uint16_t valTime){
	if(unit == 0b00) return valTime; //ms
	
	if(unit == 0b01) return (uint32_t)valTime*1000; //s

	if(unit == 0b10) return (uint32_t)valTime*1000*60; //min

	if(unit == 0b11) return (uint32_t)valTime*1000*60*60; //h
}

uint8_t Hermes::Time32b_to_12bUnit( uint32_t valTms){
	if( valTms < 1024) return 0b00; //ms
	if( valTms >= 1024 && valTms < (uint16_t)1024*60) return 0b01; //seconde
	if( valTms >= (uint16_t)1024*60 && valTms < (uint32_t)1024*60*60) return 0b10; //min
	if( valTms >= (uint32_t)1024*60*60) return 0b11; //h
}

uint16_t Hermes::Time32b_to_12bVal( uint32_t valTms){
	if( valTms < 1024) return valTms; //ms
	if( valTms >= 1024 && valTms < (uint32_t)1024*60) return valTms/1000; //seconde
	if( valTms >= (uint32_t)1024*60 && valTms < (uint32_t)1024*60*60) return valTms/((uint32_t)1000*60); //min
	if( valTms >= (uint32_t)1024*60*60) return valTms/((uint32_t)1000*60*60); //h
}

uint8_t Hermes::Exec_inWL(){
	uint8_t resMeth = -1;
	for( uint8_t i=0; i<nbfctWL; i++){
		resMeth = 0;
		
		if( WaitingList[i].TofExec < millis()){
			WaitingList[i].TofExec = millis() + Time12b_to_32b( WaitingList[i].unitlTime , WaitingList[i].lpTime);
			
			resMeth = (OpClass.*this->OpClass.TabMeth[WaitingList[i].numFct]) (WaitingList[i].arg );

			if( resMeth == 0){
				sendAck(0b010,0b001,WaitingList[i].numFct);		//error mg
				RMinWL(WaitingList[i].numFct, i); 	//remove the method
			}
			else if( resMeth == 1 && !WaitingList[i].loop){
				sendAck(0b000,0b101,WaitingList[i].numFct);	//mg method well executed
				RMinWL(WaitingList[i].numFct, i); 	//remove the method
			}
			else if(resMeth == 2 && WaitingList[i].loop){
				sendAck(0b000,0b101,WaitingList[i].numFct);	//mg method well executed
				RMinWL(WaitingList[i].numFct, i); 	//remove the method
			}

		}
	}

}

