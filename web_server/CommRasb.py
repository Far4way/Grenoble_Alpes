import serial, time, sys, select
import HermesPy as H

herm = H.HermesPy(0b100,0,0,'/dev/ttyACM1','/dev/ttyUSB1')

while True:
    while herm.readMg():
        pass
    while sys.stdin in select.select([sys.stdin], [], [], 0)[0]:
        line = sys.stdin.readline()
        if(line):
            herm.sendMgHex(int(line.strip(),16))
        else : 
            sys.stdin.flush()