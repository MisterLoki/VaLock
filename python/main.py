import re


import json
import requests
import base64
import time
import re
import json
import urllib3
urllib3.disable_warnings()
import os
import sys

exe_dir = os.getenv('APPDATA')

valock_path = os.path.join(exe_dir, "VaLock", "active")
profile = "default"
if os.path.exists(valock_path):
    with open(valock_path, encoding="utf8") as f:
        profile = f.readline()

data_file_path = os.path.join(exe_dir, "VaLock", "profiles", profile)


link = "https://glz-eu-1.eu.a.pvp.net"
with open(data_file_path,encoding="utf8") as f:
    config = json.load(f)
    
def ParseLockFile():
    f = open(os.getenv('APPDATA').replace("Roaming","Local\Riot Games\Riot Client\Config\lockfile"), "r")
    return f.read().split(":")
def headerslist():
    
    data = requests.get('https://valorant-api.com/v1/version').json()['data']
    version = f"{data['branch']}-shipping-{data['buildVersion']}-{data['version'].split('.')[3]}"
    socket = GetWebsocketAPI("/entitlements/v1/token")
    headers = {
        "Content-Type": "application/json",
        "Authorization" : "Bearer "+socket["accessToken"],
        "X-Riot-Entitlements-JWT" : socket["token"],
        'X-Riot-ClientVersion': version,
        'X-Riot-ClientPlatform': "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"
    }
    return headers

def Getbearer(lockfile : list):
    password = lockfile[3]
    password = "riot:"+password
    a = bytes(password, 'utf-8')
    return base64.b64encode(a).decode('ascii')

def GetWebsocketAPI(link : str):
    lockfile = ParseLockFile()
    bearer = Getbearer(lockfile)
    HEADERS = {
        "X-Riot-ClientPlatform":"ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9",
        "X-Riot-ClientVersion":"release-02.05-shipping-3-531230",
        "Authorization" : f"Basic {bearer}",
        "User-Agent":"PostmanRuntime/7.28.0",
        'Accept-Encoding': 'br'
    }
    response = requests.get(f"https://127.0.0.1:{lockfile[2]}{link}",headers=HEADERS,verify=False).json()
    return response

def getagent():
    agents = {}
    resp = requests.get("https://valorant-api.com/v1/agents").json()["data"]
    for x in resp:
        agents[x["displayName"]] = x["uuid"]
    return agents

def getmaps():
    agents = {}
    resp = requests.get("https://valorant-api.com/v1/maps").json()["data"]
    for x in resp:
        agents[x["mapUrl"]] = x["displayName"]
    return agents

def getappdata():
    data = []
    with open(os.getenv('APPDATA').replace("Roaming","Local/VALORANT/Saved/Logs/ShooterGame.log"),encoding="utf8") as f:
        for line in f :
            url =  re.search("(?P<url>https?://[^\s]+)", line)
            if url is not None:
                url = url.group("url")
                url = str(url)
                if url.endswith("],"):
                    data.append(url[0:-2])
                else :
                    data.append(url)
    data = list(dict.fromkeys(data))
    return data


 

def funcc():
    i = 0
    agents = getagent()  
    maps = getmaps() 
    headers = headerslist() 
    while True:
        data = getappdata()
        
        o = []
        cache = []
        for x in data:
            test = x.replace(f"{link}/pregame/v1/matches/","")
            if f"{link}/pregame/v1/matches/" in x and "/chattoken" not in x and "/voicetoken" not in x and "/loadouts" not in x and "/select" not in x and "/lock" not in x :
                o.append(x.replace(f"{link}/pregame/v1/matches/",""))
            if test in x and "core-game" in x and "/teamchatmuctoken" not in x and "/allchatmuctoken" not in x and "/loadouts" not in x and "/matches" in x and "/lock" not in x and "/select" not in x:
                cache.append(x.replace(f"{link}/core-game/v1/matches/",""))
        
        if len(o)!= 0:
            url = o[len(o)-1].replace(f"{link}/pregame/v1/matches/","")
            try :
                if url not in cache: 
                    MapID = requests.get(f"{link}/pregame/v1/matches/{url}" , headers=headers).json()["MapID"]
                    agent = agents[config[maps[MapID]]]
                    time.sleep(3)
                    print("Match Started")
                    response = requests.post(f"{link}/pregame/v1/matches/{url}/select/{agent}" , headers=headers).json()
                    time.sleep(3)
                    print(f"Map : {maps[MapID]} - Agent : {config[maps[MapID]]}")
                    response = requests.post(f"{link}/pregame/v1/matches/{url}/lock/{agent}" , headers=headers).json()
                    time.sleep(3)
                    print("See u after the game")
                    break
                else:
                    if i == 0 :
                        i+=1
                        print("Start the match")
            except:
                pass
        else:
            if i == 0 :
                print("Start the match")
                i+=1
        time.sleep(1)

    
funcc()