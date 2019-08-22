import os
import requests
import urllib.parse
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
            start = linevals[3]
            end = linevals[4]
            variable_list.append({
                'id': variable_id,
                'display_name': display_name,
                'units': units,
                'start':start,
                'end':end
            })

    return variable_list

def parse_dssat_data(data):

    wsgd_series, lai_series, gwad_series = [], [], []

    for item in data:
        time_stamp = time.mktime(datetime.strptime(str(item[0]), "%Y-%m-%d").timetuple()) * 1000
        wsgd = item[1]
        lai = item[2]
        gwad = item[3]
        wsgd_series.append([time_stamp, wsgd])
        lai_series.append([time_stamp, lai])
        gwad_series.append([time_stamp, gwad])

    wsgd_series.sort()
    lai_series.sort()
    gwad_series.sort()

    return wsgd_series, lai_series, gwad_series

def calc_color_range(min,max):

    interval = abs((max - min) / 20)

    if interval == 0:
        scale = [0] * 20
    else:
        scale = np.arange(min, max, interval).tolist()

    return scale
