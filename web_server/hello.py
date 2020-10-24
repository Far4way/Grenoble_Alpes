import sys
counter=0

while True:
    line = sys.stdin.readline()
    if line :
        stringueu = line.strip() + str(counter)
        print(stringueu,flush=True)
        counter+=1
