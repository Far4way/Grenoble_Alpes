import serial, time

class HermesPy:
    
    def __init__(self, arg_idRaspb, arg_Pmode = 0, arg_mg=0, arg_pathComm1 = '0', arg_pathComm2 = '0' ):
        self.__id = arg_idRaspb
        self.__mg = arg_mg
        self.__printMode = arg_Pmode
        
        if arg_pathComm1 != '0' :
            self.__ard1 = serial.Serial( arg_pathComm1 , timeout=.01, baudrate=19200, writeTimeout=0.01)
            
        else:
            self.__ard1 = None

        if arg_pathComm2 != '0':
            self.__ard2 = serial.Serial( arg_pathComm2 , timeout=.01, baudrate=19200, writeTimeout=0.01)

        else:
            self.__ard2 = None

        time.sleep(2)
        #rqt reset
        if self.__ard1.isOpen():
            print("Ard1 says: Channel Open", flush=True)
        else:
            raise NameError("Ard1 says: error opening channel arduino 1")
                #rqt reset
        
        if self.__ard2.isOpen():
            print("Ard2 says: Channel Open", flush=True)
        else:
            raise NameError("Ard2 says: error opening channel arduino 1")

        self.sendMgHex(0x57000000)
        self.sendMgHex(0x37000000)

    def print(self, stringg):
        if self.__printMode == 2:
            print(stringg, flush=True)
        if self.__printMode == 1:
            if stringg[0] != '#' and stringg[0] != '*':
                print(stringg, flush=True)
        if self.__printMode == 0:
            if stringg[0] != '>' and stringg[0] != '#' and stringg[0] != '*':
                print("Ard" + str(self.fromMg_getIdArd())+ " says: " +  stringg, flush=True)



    def toStringTime(self, unit, valTime):
        if unit == 0b00:
            return str(valTime) + " ms"
        if unit == 0b01:
            return str(valTime) + " s"
        if unit == 0b10:
            return str(valTime) + " min"
        if unit == 0b11:
            return str(valTime) + " h"

        return ""

        
    def toStringTypeArgMeth(self, typeArgMeth):
        if typeArgMeth == 0b00:
            return "float"
        if typeArgMeth == 0b01:
            return "uint8_t"
        if typeArgMeth == 0b10:
            return "uint16_t"
        if typeArgMeth == 0b11:
            return "uint32_t"

        if typeArgMeth == 0b100:
            return "method"

        return ""

    def toStringTypeMg(self, typeMg = 0xff, Ttype = 0xff):
        if typeMg == 0b00: #ack
            if Ttype == 0b000:  
                return "success message"
            if Ttype == 0b001:
                return "interpretation error message"
            if Ttype == 0b010:
                return "functioning error message"
            
            
        
        if typeMg == 0b01: #debug message
            return "debug message"

        if typeMg == 0b10:
            if Ttype == 0b000:
                return "request message: get 1 information"
            if Ttype == 0b001:
                return "request message: get 2 information"
            if Ttype == 0b010:
                return "request message: set 1 argument"
            if Ttype == 0b011:
                return "request message: set 2 arguments"
            if Ttype == 0b100:
                return "request message: add in the waiting list"
            if Ttype == 0b101:
                return "request message: resend a message"
            if Ttype == 0b110:
                return "request message: remove a function in the waiting list"
        
        if typeMg == 0b11:
            if Ttype == 0b000:
                return "information message: 1 argument"
            if Ttype == 0b001:
                return "information message: 2 arguments"
            if Ttype == 0b010:
                return "information message: number method / arguments"
            if Ttype == 0b011:
                return "information message: waiting list"
        

        if Ttype == 0xff and typeMg == 0xff:
            return self.toStringTypeMg( self.fromMg_setType(), self.fromMg_setTtype()  )


    def fromMg_getIdArd(self):
        return (self.__mg & 0xe0000000) >> 29
    
    def fromMg_getType(self):
        return (self.__mg & 0x18000000) >> 27
    
    def fromMg_getTtype(self):
        return (self.__mg & 0x07000000) >> 24

    def fromMg_getBody(self): 
        return self.__mg & 0xffff
    
    def fromMg_setIdArd(self, idArd):
        self.__mg = self.__mg - (self.__mg & 0xe0000000) + ( (idArd << 29) & 0xe0000000 )
    
    def fromMg_setType(self, typeMg):
        self.__mg = self.__mg - (self.__mg & 0x18000000) + ( (typeMg << 27) & 0x18000000 )
    
    def fromMg_setTtype(self, Ttype):
        self.__mg = self.__mg - (self.__mg & 0x07000000) + ( (Ttype << 24) & 0x07000000 )


    def readMg(self):
        ok = False

        if self.__ard1.in_waiting >= 4:
            self.__mg = self.__ard1.read(4)
            if self.__mg:
                self.__ard1.flush()
                self.__mg = int.from_bytes(self.__mg,'big')
                
                self.print("#\tmessage from Arduino " + str(self.fromMg_getIdArd()) + "\t#" )
                self.print("#\tmessage: " + str(hex(self.__mg)) + "\t#")
                self.Interpret()
                #if(self.__ard1.read(4)):
                #    self.readMg()
                ok = True
            else:
                ok = False
        if self.__ard2.in_waiting >= 4:
            self.__mg = self.__ard2.read(4)
            if self.__mg:
                self.__ard2.flush()
                self.__mg = int.from_bytes(self.__mg,'big')
                
                self.print("#\tmessage from Arduino " + str(self.fromMg_getIdArd()) + "\t#" )
                self.print("#\tmessage: " + str(hex(self.__mg)) + "\t#")
                self.Interpret()
                #if(self.__ard2.read(4)):
                #    self.readMg()
                ok = True
            else:
                ok = False
        return ok



    def interpAck(self):
        Tack = self.fromMg_getTtype()
        ack = (self.__mg>>21)&0x07
        if  Tack == 0b00:
            self.print("#\tTinf: success\tArduino: " + str(self.fromMg_getIdArd()) + "\t#")

            if ack == 0b000:
                self.print("\thello")
                return 1
            if ack == 0b001:
                self.print("\tok")
                return 1
            if ack == 0b010:
                self.print("processing\twill be done in " + self.toStringTime( (self.fromMg_getBody()>>10)&0x03 , self.fromMg_getBody()&0x03ff) )
                return 1
            if ack == 0b011:
                self.print("\tcontinue")
                return 1
            if ack == 0b100:
                self.print("\twell executed the " + str( self.toStringTypeMg( 0b10, self.fromMg_getBody()) ) )
                return 1
            if ack == 0b101:
                self.print("\tfunction " + str( self.fromMg_getBody()) + " well executed" )
                return 1

            self.print("* ack from Tack " + str(Tack) + " no exist *")
            return 0


        if Tack == 0b01:
            self.print("#\tTinf: interpetion error\tArduino: " + str(self.fromMg_getIdArd()) + "\t#")


            if ack == 0b000:
                self.print("\twrong recipient: " + str( hex(self.fromMg_getBody())) )
                return 1
            if ack == 0b001:
                self.print("\tnot understand\n\tmessage: " + str(self.fromMg_getBody()) )
                return 1
            if ack == 0b010:
                self.print("\tno content information\n\tnumber argument: " + str(self.fromMg_getBody()) )
                return 1
            if ack == 0b011:
                self.print("\tno content method\n\tnumber method: " + str(self.fromMg_getBody()) )
                return 1
            if ack == 0b100:
                self.print("\terror remove function in the waiting list\n\tnumber method: " + str(self.fromMg_getBody()) )
                return 1
            if ack == 0b101:
                self.print("\tWaiting list full: " + str(self.fromMg_getBody()) )
                return 1

            self.print("* ack from Tack " + str(Tack) + " no exist *")
            return 0

        if Tack == 0b10:
            self.print("#\tTinf: functioning error\tArduino: " + str(self.fromMg_getIdArd()) + "\t#")

            
            if ack == 0b000:
                self.print("\tallocation error\n\ttype argument: " + self.toStringTypeArgMeth( self.fromMg_getBody()&0x07 ) )
                return 1
            if ack == 0b001:
                self.print("\terror function: " + str(self.fromMg_getBody()) )
                return 1
            if ack == 0b010:
                self.print("\terror delay execution\n\tnumber method: " + str(self.fromMg_getBody()) )
                return 1
            if ack == 0b011:
                self.print("\terror calcul\n\tnumber argument: " + str(self.fromMg_getBody()) )
                return 1
            if ack == 0b100:
                self.print("\terror process")
                return 1


        self.print("* Tack no exist *")
        return 0


    def interpInfo(self):
        Tinf = self.fromMg_getTtype()
        if Tinf == 0b000:   #1 arg
            t=(self.__mg>>16)&0x03    #argument type
            numArg = (self.__mg>>18)&0x3f
            stringg = "\targument number " + str( numArg ) + " (" + self.toStringTypeArgMeth( t ) + ")\n"

            value = self.__mg&0xffff
            if t == 0b00:   #float
                value = float(value)/100.0
            if t == 0b11:   #uint32_t
                if self.readMg(): #wait the last part og the value
                    
                    if self.fromMg_getType() == 0b11 and self.fromMg_getTtype() == 0b000 and numArg == (self.__mg>>18)&0x3f: #if same message
                        value = (value<<16) + (self.__mg&0xffff)
                        self.print(stringg + "\tvalue: " + str( value ))
                    else:
                        self.print(stringg + "\tvalue: " + str( value ))
                        self.Interpret()
            else:
                self.print(stringg + "\tvalue: " + str( value ))
            return 1

        if Tinf == 0b001:   #2 arg
            self.print("\targument number " + str( (self.__mg>>18)&0x3f ) + " (" + self.toStringTypeArgMeth( (self.__mg>>16)&0x03 ) + ")"  )
            self.print("\tvalue: " + str( (self.__mg>>8)&0xff ))
            self.print("\targument number " + str( 1+ (self.__mg>>18)&0x3f ) + " (" + self.toStringTypeArgMeth( (self.__mg>>16)&0x03 ) + ")"  )
            self.print("\tvalue: " + str( self.__mg & 0xff ))
            return 1

        if Tinf == 0b010:   #nb Arg / Method
            stringg = "\tI have " + str( (self.__mg>>18)&0x3f ) + " methods\n"
            stringg += "\t       " + str( (self.__mg>>14)&0x0f ) + " float arguments\n"
            stringg += "\t       " + str( (self.__mg>>9)&0x1f ) + " uint8_t arguments\n"
            stringg += "\t       " + str( (self.__mg>>4)&0x1f ) + " uint16_t arguments\n"
            stringg += "\t       " + str( (self.__mg)&0x0f ) + " uint32_t arguments\n"
            self.print(stringg + "\tin my operating class")
            return 1

        if Tinf == 0b011:   #waiting list
            stringg = "\tfunction in the waiting list:\n"
            stringg += "\tnumber: " + str( (self.__mg>>18)&0x3f ) + "\targument: " + str( (self.__mg>>13)&0x1f) + "\n"

            if (self.__mg>>12)&0x01 == 1:
                stringg += "\tloop function: " + self.toStringTime( (self.__mg>>10)&0x03, self.__mg&0x03ff ) + " per loop\n"
            else:
                stringg += "\tfunction will be executed in: " + self.toStringTime( (self.__mg>>10)&0x03, self.__mg&0x03ff ) + "\n"
            self.print(stringg)
            return 1

        self.print("* Tinf no exist *")
        return 0


    def Interpret(self):


        self.print(">>Arduino " + str(self.fromMg_getIdArd()) + " says:")

        #type
        if self.fromMg_getType() == 0b00 :
            self.print("#___ack_message_____#")
            self.interpAck()

        if self.fromMg_getType() == 0b01:
            self.print("#___debug_message___#")
            self.print("#\tbody: " + str(hex(self.fromMg_getBody())) + "\t\t#")

        if self.fromMg_getType() == 0b10:
            self.print("#___request_message___#")
            self.print("# no order to reciveid from a slave #")

        if self.fromMg_getType() == 0b11:
            self.print("#___information_message___#")
            self.interpInfo()
        
    

    def sendMgHex(self, mg):
        self.__mg = mg

        if self.fromMg_getIdArd() == 0b001:
            self.__ard1.write( self.__mg.to_bytes(4,'big') )
            print('message send: ' + hex(self.__mg) + ' to arduino 1', flush=True)
            return 1
        
        if self.fromMg_getIdArd() == 0b010:
            self.__ard2.write( self.__mg.to_bytes(4,'big') )
            print('message send: ' + hex(self.__mg) + ' to arduino 2', flush=True)
            return 1
        
        return 0


    def sendMg(self, id_ard, typeMg, Ttype, body=0 ):
        self.__mg = body
        self.fromMg_setIdArd( id_ard )
        self.fromMg_setType( typeMg )
        self.fromMg_setTtype( Ttype )

        if id_ard == 0b001:
            self.__ard1.write( self.__mg.to_bytes(4,'big') )
            print('message send: ' + hex(self.__mg) + ' to arduino 1', flush=True)
        
        if id_ard == 0b010:
            self.__ard2.write( self.__mg.to_bytes(4,'big') )
            print('message send: ' + hex(self.__mg) + ' to arduino 2', flush=True)