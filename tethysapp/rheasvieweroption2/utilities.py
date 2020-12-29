import os
import requests
import urllib.parse
import csv
from os import path
from datetime import datetime
import time
import numpy as np


#Note really used, but this is an example of uploading a tiff file to a geoserver
def get_var_tiff(dir,var,prefix):
    headers = {
        'Content-type': 'image/tiff',
    }

    for file in sorted(os.listdir(dir)):
        if var in file:
            data = open(dir + file, 'rb').read()  # Read the file
            name = file.split("_")
            store_name = prefix+"_"+var+"_"+name[1]
            request_url = '{0}workspaces/{1}/coveragestores/{2}/file.geotiff'.format("http://tethys.servirglobal.net:8181/geoserver/rest/", "rheas",
                                                                                     store_name)  # Creating the rest url
            requests.put(request_url, headers=headers, data=data,
                         auth=("admin", "geoserver"))  # Creating the resource on the geoserver. Update the credentials based on your own geoserver instance.

def get_var_dates(dir,var,prefix):

    dates = []
    for file in sorted(os.listdir(dir)):
        if var in file:
            name = file.split("_")

            dates.append(name[1])

    return dates

def parse_bbox(response):
    olurl = response['result']['wms']['openlayers']
    parsedkml = urlparse.urlparse(olurl)
    bbox = urlparse.parse_qs(parsedkml.query)['bbox']

    print(bbox)

def get_variables_meta():

    db_file = path.join(path.dirname(path.realpath(__file__)), 'public/data/vic_config.txt')
    variable_list = []
    with open(db_file, mode='r') as f:
        f.readline()  # Skip first line

        lines = f.readlines()

    for line in lines:
        if line != '':
            line = line.strip()
            linevals = line.split('|')
            variable_id = linevals[0]
            display_name = linevals[1]
            units = linevals[2]
            color1 = linevals[3]
            color2 = linevals[4]
            color3 = linevals[5]
            variable_list.append({
                'id': variable_id,
                'display_name': display_name,
                'units': units,
                'color1': color1,
                'color2': color2,
                'color3': color3,
                'min': linevals[6],
                'max': linevals[7]
            })

    return variable_list

def parse_dssat_data(data):

    wsgd_series, lai_series,wsgd_cum_series, lai_cum_series, gwad_series = [], [], [], [], []
    lai_cum=0.0
    wsgd_cum=0.0
    for item in data:
        time_stamp = time.mktime(datetime.strptime(str(item[0]), "%Y-%m-%d").timetuple()) * 1000
        wsgd_cum = wsgd_cum+item[1]#cum
        lai_cum = lai_cum+item[2]#cum
        wsgd = item[1]
        lai = item[2]
        gwad = item[3]
        wsgd_series.append([time_stamp, wsgd])
        lai_series.append([time_stamp, lai])
        wsgd_cum_series.append([time_stamp, wsgd_cum])
        lai_cum_series.append([time_stamp, lai_cum])
        gwad_series.append([time_stamp, gwad])
    wsgd_series.sort()
    lai_series.sort()
    wsgd_cum_series.sort()
    lai_cum_series.sort()
    gwad_series.sort()

    return wsgd_series, lai_series, wsgd_cum_series, lai_cum_series, gwad_series

def parse_outlook_dssat_data(data,sdate,edate,gid):
    startdate=datetime.strptime(sdate, '%Y-%m-%d')
    enddate=datetime.strptime(edate, '%Y-%m-%d')
    lai_series, lai_cum_series, gwad_series,lai_95series,lai_5series,gwad_95series,gwad_5series = [], [], [],[],[],[],[]
    lai_cum=0.0
    ninetyfifthpercent_LAI=0.0
    fifthpercent_LAI=0.0
    ninetyfifthpercent_GWAD=0.0
    fifthpercent_GWAD=0.0
    try:

        with open( path.join(path.dirname(path.realpath(__file__)), 'public/data/LTA_allGIDs/LTA_'+str(gid)+'.csv'), mode='r') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            line_count = 0
            for csvrow in csv_reader:
                for row in data:
                    d=datetime.strptime(row[1].strftime("%Y-%m-%d"), '%Y-%m-%d')
                    if int(csvrow["fdate"]) == row[0] and d<enddate and d>startdate:
                        time_stamp = time.mktime(row[1].timetuple()) * 1000
                        lai_cum = lai_cum + float(csvrow["Avg_LAI"] ) # cum
                        lai = float(csvrow["Avg_LAI"])
                        gwad = float(csvrow["Avg_GWAD"])
                        lai_sd=float(csvrow["SD_LAI"])
                        gwad_sd=float(csvrow["SD_GWAD"])
                        ninetyfifthpercent_LAI=lai+lai_sd
                        if lai-lai_sd<0:
                            fifthpercent_LAI=0.0
                        else:
                            fifthpercent_LAI=lai-lai_sd
                        ninetyfifthpercent_GWAD =gwad+gwad_sd
                        if gwad-gwad_sd<0:
                            fifthpercent_GWAD = 0.0
                        else:
                            fifthpercent_GWAD =gwad-gwad_sd
                        lai_series.append([time_stamp, lai])
                        lai_cum_series.append([time_stamp, lai_cum])
                        lai_95series.append([time_stamp, ninetyfifthpercent_LAI])
                        lai_5series.append([time_stamp, fifthpercent_LAI])
                        gwad_95series.append([time_stamp, ninetyfifthpercent_GWAD])
                        gwad_5series.append([time_stamp, fifthpercent_GWAD])
                        gwad_series.append([time_stamp, gwad])
                line_count += 1
            lai_series.sort()
            lai_cum_series.sort()
            lai_5series.sort()
            lai_95series.sort()
            gwad_5series.sort()
            gwad_95series.sort()
            gwad_series.sort()
    except Exception as e:
        print(e)
    return lai_series, lai_cum_series, lai_95series,lai_5series,gwad_series,gwad_95series,gwad_5series

def calc_color_range(min,max):
    interval = abs((float(max) - float(min)) / 20)
    if interval == 0:
        scale = [0] * 20
    else:
        scale = np.arange(float(min), float(max), interval).tolist()
    return scale

def calc_color_range1(min,max):
    interval = abs((max - min) / 5)

    if interval == 0:
        scale = [0] * 5
    else:
        scale = np.arange(min, max, interval).tolist()

    return scale
