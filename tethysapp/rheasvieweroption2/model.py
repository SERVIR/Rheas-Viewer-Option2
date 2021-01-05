import psycopg2
import json
from tethysapp.rheasvieweroption2.utilities import *
import math
import tethysapp.rheasvieweroption2.config as cfg
from geoserver.catalog import Catalog
import geoserver
import shapely
import shapely.geometry
from shapely.geometry import Polygon
import requests
import logging
import tempfile, shutil, os, sys, zipfile
from os.path import basename
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
import netCDF4
import calendar
import json
import numpy as np
import geopandas as gpd
import logging
import xarray
import regionmask
import rioxarray

log = logging.getLogger(__name__)
default_schemas = ['basin', 'crops', 'dssat', 'ken_test', 'information_schema', 'lai', 'precip', 'public', 'soilmoist',
                   'test', 'test_ke', 'test_tza', 'tmax', 'tmin', 'topology', 'vic', 'wind', 'pg_toast', 'pg_temp_1',
                   'pg_toast_temp_1', 'pg_catalog', 'ken_vic', 'tza_vic', 'eth_vic', 'tza_nrt']


# logging.basicConfig(filename='darwin.log',level=logging.INFO)

def get_selected_raster(db, region, variable, date):
    # logging.info(str(region)+','+str(variable)+','+str(date))
    try:
        # logging.info('Connecting to the database')
        conn = psycopg2.connect(
            "dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'], cfg.connection['host'],
                                                               cfg.connection['password']))
        cur = conn.cursor()

        storename = db + '_' + region + '_' + variable + '_' + date
        #
        # cat = Catalog(cfg.geoserver['rest_url'], username=cfg.geoserver['user'], password=cfg.geoserver['password'],disable_ssl_certificate_validation=True)
        #
        # try:
        #     # logging.info('Check if the layer exists')
        #     something = cat.get_store(storename,cfg.geoserver['workspace'])
        #     if not something:
    # # logging.info('Layer doesnt exist')
    #         print( "No store")
    #         raise Exception
    #     else:
    #         mean, stddev = get_vic_summary(db,region, variable, date)
    #         # logging.info(str(mean)+str(stddev)+str(min)+str(max))
    #         return storename, mean, stddev
    # except Exception  as e:
    #     # logging.info('Entering geoserver code')
    # # logging.error('Error at failed request ' + str(e))
    #     try:
    #         # logging.info('Starting the geoserver stuff')
    #         sql = """SELECT ST_AsGDALRaster(rast, 'GTiff') as tiff FROM {0}.{1} WHERE id={2}""".format(region, variable, date)
    #         cur.execute(sql)
    #         data = cur.fetchall()
    #         # logging.info(str(data))
    #
    #         mean, stddev= get_vic_summary(db,region, variable, date)
    #         # logging.info('Work you piece ...')
    #         rest_url = cfg.geoserver['rest_url']
    #         # logging.info(str(rest_url))
    #
    #         if rest_url[-1] != "/":
    #             rest_url = rest_url + '/'
    #
    #         headers = {
    #             'Content-type': 'image/tiff',
    #         }
    #
    #         request_url = '{0}workspaces/{1}/coveragestores/{2}/file.geotiff'.format(rest_url,
    #                                                                                  cfg.geoserver['workspace'],
    #                                                                                  storename)  # Creating the rest url
    #         # logging.info('Get the username and password')
    #         user = cfg.geoserver['user']
    #         password = cfg.geoserver['password']
    #         # logging.info('Right before the put command')
    #         requests.put(request_url,verify=False,headers=headers, data=data[0][0],
    #                          auth=(user, password))  # Creating the resource on the geoserver
    #
    #         # logging.info(request_url)
    #         return storename, mean, stddev
    #
    #     except Exception as er:
    # # logging.info('Error at uplaoding tiff '+ str(e))
    #         return str(er)+' This is while adding the raster layer.'

    except Exception as err:
        # logging.info(str(err) + ' This is generic catch all')
        return str(err) + ' This is the generic one'


def get_vic_summary(db, region, variable, date):
    try:
        conn = psycopg2.connect(
            "dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'], cfg.connection['host'],
                                                               cfg.connection['password']))
        cur = conn.cursor()

        sql2 = """SELECT ST_SummaryStats(rast,1,TRUE) as stats FROM {0}.{1} WHERE id={2}""".format(region, variable,
                                                                                                   date)
        cur.execute(sql2)
        data = cur.fetchall()[0][0]
        summary = data.strip("(").strip(")").split(',')
        count = summary[0]
        mean = round(float(summary[2]), 3)
        stddev = round(float(summary[3]), 3)
        conn.close()

        return mean, stddev
    except Exception as e:
        print(e)
        return e


@csrf_exempt
def get_vic_point(db, region, variable, point, sd, ed):
    try:
        conn = psycopg2.connect(
            "dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'], cfg.connection['host'],
                                                               cfg.connection['password']))
        cur = conn.cursor()

        ssql = """SELECT ST_SummaryStatsAgg(rast, 1, TRUE) AS stats FROM {0}.{1}""".format(region, variable)
        cur.execute(ssql)
        data = cur.fetchall()[0][0]
        summary = data.strip("(").strip(")").split(',')
        count = summary[0]
        mean = round(float(summary[2]), 3)
        stddev = round(float(summary[3]), 3)
        min = round(float(summary[4]), 3)
        max = round(float(summary[5]), 3)
        coords = point.split(',')
        lat = round(float(coords[1]), 2)
        lon = round(float(coords[0]), 2)
        # if len(sd)>0 and len(ed)>0:
        psql = """SELECT  fdate,ST_Value(rast, 1, ST_SetSRID(ST_Point({0},{1}), 4326)) as b1 FROM {2}.{3} WHERE ST_Intersects(rast, ST_SetSRID(ST_Point({0},{1}), 4326)::geometry, 1) and fdate between {4} and {5} """.format(
            lon, lat, region, variable, "'" + sd + "'", "'" + ed + "'")
        # else:
        #   psql = """SELECT  fdate,ST_Value(rast, 1, ST_SetSRID(ST_Point({0},{1}), 4326)) as b1 FROM {2}.{3} WHERE ST_Intersects(rast, ST_SetSRID(ST_Point({0},{1}), 4326)::geometry, 1)""".format(lon,lat,region,variable)
        cur.execute(psql)
        ts = cur.fetchall()

        time_series = []
        for item in ts:
            time_stamp = time.mktime(datetime.strptime(str(item[0]), "%Y-%m-%d").timetuple()) * 1000
            if (variable == 'prec' or variable == 'evap') and float(item[1]) < 0:
                val = 0
            else:
                val = round(float(item[1]), 3)
            time_series.append([time_stamp, val])

        time_series.sort()

        conn.close()

        return mean, stddev, min, max, time_series

    except Exception as e:
        print(e)
        return e


@csrf_exempt
def get_vic_polygon1(db, region, variable, polygon, sd, ed):
    try:
        # print("in vicpoly")
        # get_pt_values("evap_final.nc",polygon)
        conn = psycopg2.connect(
            "dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'], cfg.connection['host'],
                                                               cfg.connection['password']))
        cur = conn.cursor()

        ssql = "SELECT ST_SummaryStatsAgg(rast, 1, TRUE) AS stats FROM {0}.{1}".format(region, variable)
        cur.execute(ssql)
        data = cur.fetchall()[0][0]
        summary = data.strip("(").strip(")").split(',')
        count = summary[0]
        mean = round(float(summary[2]), 3)
        stddev = round(float(summary[3]), 3)
        min = round(float(summary[4]), 3)
        max = round(float(summary[5]), 3)
        polygon = json.loads(polygon)

        polygon_str = ''
        for item in polygon["coordinates"][0]:
            coord = str(item[0]) + ' ' + str(item[1]) + ','

            polygon_str += coord

        polygon_str = polygon_str[:-1]
        poly_sql = """SELECT fdate, CAST(AVG(((foo.geomval).val)) AS decimal(9,3)) as avgimr FROM (SELECT fdate, ST_Intersection(rast,ST_GeomFromText('POLYGON(({0}))',4326)) AS geomval FROM {1}.{2} WHERE ST_Intersects(ST_GeomFromText('POLYGON(({0}))',4326), rast) AND fdate between {3} and {4}) AS foo GROUP BY fdate ORDER BY fdate""".format(
            polygon_str, region, variable, "'" + sd + "'", "'" + ed + "'")
        cur.execute(poly_sql)
        poly_ts = cur.fetchall()
        time_series = []
        for item in poly_ts:
            time_stamp = time.mktime(datetime.strptime(str(item[0]), "%Y-%m-%d").timetuple()) * 1000
            if (variable == 'prec' or variable == 'evap') and float(item[1]) < 0:
                val = 0
            else:
                val = round(float(item[1]), 3)
            time_series.append([time_stamp, val])

        time_series.sort()
        conn.close()

        return mean, stddev, min, max, time_series
    except Exception as e:
        print(e)
        return e


@csrf_exempt
def get_database():
    try:
        conn = psycopg2.connect(user=cfg.connection['user'], host=cfg.connection['host'],
                                password=cfg.connection['password'])
        cur = conn.cursor()
        sql = """SELECT datname FROM pg_database WHERE datistemplate = false"""
        cur.execute(sql)
        data = cur.fetchall()

        rheas_dbs = [db[0] for db in data if 'postgres' not in db[0]]
        conn.close()
        return rheas_dbs

    except Exception as e:
        print(e)
        return e
@csrf_exempt
def get_outlook_database():
    try:
        conn = psycopg2.connect(user=cfg.connection['user'], host=cfg.connection['host'],
                                password=cfg.connection['password'])
        cur = conn.cursor()
        sql = """SELECT datname FROM pg_database WHERE datistemplate = false and datname like 'forecast________' order by datname"""
        cur.execute(sql)
        data = cur.fetchall()

        rheas_dbs = [db[0] for db in data if 'postgres' not in db[0]]
        conn.close()
        return rheas_dbs

    except Exception as e:
        print(e)
        return e

@csrf_exempt
def get_schemas(db):
    try:
        conn = psycopg2.connect(
            "dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'], cfg.connection['host'],
                                                               cfg.connection['password']))
        cur = conn.cursor()
        sql = """select schema_name from information_schema.schemata"""
        cur.execute(sql)
        data = cur.fetchall()
        regions = [region[0] for region in data if region[0] not in default_schemas]
        conn.close()
        regions.sort()
        return regions

    except Exception as e:
        print(e)
        return e


@csrf_exempt
def get_variables(db, region):
    try:
        conn = psycopg2.connect(
            "dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'], cfg.connection['host'],
                                                               cfg.connection['password']))
        cur = conn.cursor()
        sql = """SELECT table_name FROM information_schema.tables WHERE table_schema = '{0}'""".format(region)
        cur.execute(sql)
        data = cur.fetchall()
        variables = [var[0] for var in data if var[0] != "basin" if var[0] != "agareas" if var[0] != "state" if
                     var[0] != "dssat" if var[0] != "dssat_all" if var[0] != "yield"]
        variables.sort()
        conn.close()
        return variables
    except Exception as e:
        return e


@csrf_exempt
# def get_times(db,region,variable):
#
#     try:
#         conn = psycopg2.connect("dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'],cfg.connection['host'], cfg.connection['password']))
#         cur = conn.cursor()
#         sql = """SELECT fdate,id FROM {0}.{1}""".format(region,variable)
#
#         cur.execute(sql)
#         data = cur.fetchall()
#
#         dates = [[datetime.strftime(date, "%Y-%m-%d"),id] for date,id in data]
#         dates.sort()
#         conn.close()
#         return dates
#     except Exception as e:
#         print(e)
#         return e

def export_pg_table(export_path, pgtable_name, host, username, password, db, pg_sql_select):
    cmd = '''/home/tethys/miniconda/envs/tethys/bin/ogr2ogr -overwrite -f \"ESRI Shapefile\" {export_path}/{pgtable_name}.shp PG:"host={host} user={username} dbname={db} password={password}" -sql "{pg_sql_select}"'''.format(
        pgtable_name=pgtable_name, export_path=export_path, host=host, username=username, db=db, password=password,
        pg_sql_select=pg_sql_select)
    os.system(cmd)


def check_dssat_schema(db):
    schemas = get_schemas(db)

    ds_schema = []

    try:

        conn = psycopg2.connect(
            "dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'], cfg.connection['host'],
                                                               cfg.connection['password']))
        cur = conn.cursor()
        for schema in schemas:

            sql = """SELECT table_name FROM information_schema.tables WHERE table_schema = '{0}'""".format(schema)
            cur.execute(sql)
            data = cur.fetchall()
            variables = [var[0] for var in data]
            if "agareas" in variables and "dssat" in variables and "yield" in variables:
                ds_schema.append(schema)

        conn.close()
        return ds_schema

    except Exception as e:
        print(e)
        return e


def get_dssat_ensemble(db, gid, schema):
    try:
        conn = psycopg2.connect(
            "dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'], cfg.connection['host'],
                                                               cfg.connection['password']))
        cur = conn.cursor()

        sql = """SELECT DISTINCT ensemble FROM {0}.dssat WHERE ccode={1} ORDER BY ensemble""".format(schema,
                                                                                                     "'" + gid + "'")

        cur.execute(sql)
        data = cur.fetchall()
        ensembles = [ens[0] for ens in data]
        conn.close()

        return ensembles
    except Exception as e:
        print(e)
        return e


def get_dssat_gid(db, schema):
    try:
        conn = psycopg2.connect(
            "dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'], cfg.connection['host'],
                                                               cfg.connection['password']))
        cur = conn.cursor()

        sql = """SELECT DISTINCT gid FROM {0}.dssat""".format(schema)

        cur.execute(sql)
        data = cur.fetchall()
        gids = [gid[0] for gid in data]
        conn.close()

        return gids
    except Exception as e:
        print(e)
        return e


@csrf_exempt
def get_dssat_values(db, gid, schema, ensemble, startdate, enddate):
    try:
        conn = psycopg2.connect(
            "dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'], cfg.connection['host'],
                                                               cfg.connection['password']))

        cur = conn.cursor()

        s = "'" + startdate + "'"
        e = "'" + enddate + "'"
        sql1 = ""

        # if len(startdate)>9 and len(enddate)>9:
        #  sql1 = """SELECT max,ensemble,ntile(100) over(order by max) AS percentile FROM(SELECT ensemble,MAX(gwad) FROM {0}.dssat_all WHERE gid={1} AND fdate>={2} AND fdate<={3} GROUP BY ensemble) as foo""".format(schema,int(gid),s,e)
        sql1 = """SELECT max,ensemble,ntile(100) over(order by max) AS percentile FROM(SELECT dssat_all.ensemble,MAX(dssat_all.gwad) FROM {0}.dssat dssat,{0}.dssat_all dssat_all WHERE dssat.gid=dssat_all.gid and ccode={1} AND fdate>={2} AND fdate<={3} GROUP BY dssat_all.ensemble) as foo""".format(
            schema, "'" + gid + "'", s, e)
        #print(sql1)
        # else:
        #   sql1 = """SELECT max,ensemble,ntile(100) over(order by max) AS percentile FROM(SELECT ensemble,MAX(gwad) FROM {0}.dssat_all WHERE gid={1} GROUP BY ensemble) as foo""".format(schema,int(gid))
        cur.execute(sql1)
        data1 = cur.fetchall()
        medianens = data1[math.ceil(len(data1) / 2) - 1]
        lowens = data1[1]
        highens = data1[len(data1) - 2]
        if "avg" in ensemble:
            ensemble=medianens[1]
        med_wsgd_series, med_lai_series, med_wsgd_cum_series, med_lai_cum_series, med_gwad_series = get_dssat_ens_values(
            cur, gid, schema, medianens[1], "'" + startdate + "'", "'" + enddate + "'")
        low_wsgd_series, low_lai_series, low_wsgd_cum_series, low_lai_cum_series, low_gwad_series = get_dssat_ens_values(
            cur, gid, schema, lowens[1], "'" + startdate + "'", "'" + enddate + "'")
        high_wsgd_series, high_lai_series, high_wsgd_cum_series, high_lai_cum_series, high_gwad_series = get_dssat_ens_values(
            cur, gid, schema, highens[1], "'" + startdate + "'", "'" + enddate + "'")
        LTA_lai_series, LTA_lai_cum_series, LTA_lai_95series,LTA_lai_5series,LTA_gwad_series,LTA_gwad_95series,LTA_gwad_5series=get_outlook_dssat_values(db, gid, schema, ensemble, startdate, enddate)
        ensemble_info = [lowens[1], medianens[1], highens[1]]
        conn.close()
        return med_wsgd_series, med_lai_series, low_lai_series, high_lai_series, med_wsgd_cum_series, med_lai_cum_series, med_gwad_series, low_gwad_series, high_gwad_series, LTA_lai_series, LTA_lai_cum_series, LTA_lai_95series,LTA_lai_5series,LTA_gwad_series,LTA_gwad_95series,LTA_gwad_5series, ensemble_info


    except Exception as e:
        return e


@csrf_exempt
def get_outlook_dssat_values(db, gid, schema, ensemble, startdate, enddate):
    try:
        conn = psycopg2.connect(
            "dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'], cfg.connection['host'],
                                                               cfg.connection['password']))

        cur = conn.cursor()
        lai_series, lai_cum_series, lai_95series,lai_5series,gwad_series,gwad_95series,gwad_5series= get_outlook_dssat_ens_values(
            cur, gid, schema, ensemble, startdate ,enddate )

        conn.close()
        return lai_series, lai_cum_series, lai_95series,lai_5series,gwad_series,gwad_95series,gwad_5series
    except Exception as e:

        return e


@csrf_exempt
def get_dssat_ens_values(cur, gid, schema, ensemble, startdate, enddate):
    try:
        if len(startdate) > 9 and len(enddate) > 9:
            sql = """SELECT fdate,dssat_all.wsgd,dssat_all.lai,dssat_all.gwad FROM {0}.dssat_all dssat_all,{0}.dssat dssat WHERE dssat.gid=dssat_all.gid and ccode={1} AND dssat_all.ensemble={2} AND fdate>={3} AND fdate<={4} ORDER BY fdate;""".format(
                schema, "'" + gid + "'", int(ensemble), str(startdate), str(enddate))
        else:
            sql = """SELECT fdate,dssat_all.wsgd,dssat_all.lai,dssat_all.gwad FROM {0}.dssat_all dssat_all,{0}.dssat dssat WHERE dssat.gid=dssat_all.gid and ccode={1} AND dssat_all.ensemble={2} ORDER BY fdate;""".format(
                schema, "'" + gid + "'", int(ensemble))
        cur.execute(sql)
        data = cur.fetchall()
        wsgd_series, lai_series, wsgd_cum_series, lai_cum_series, gwad_series = parse_dssat_data(data)
        return wsgd_series, lai_series, wsgd_cum_series, lai_cum_series, gwad_series
    except Exception as e:
        print(e)
        return e

@csrf_exempt
def get_outlook_dssat_ens_values(cur, ccode, schema, ensemble, startdate, enddate):
    try:
        gid=get_gid(cur,schema,ccode)
        if len(startdate) > 9 and len(enddate) > 9:
            sql = """SELECT distinct DATE_PART('week',fdate) weeknumber,fdate FROM {0}.dssat_all dssat_all,{0}.dssat dssat WHERE dssat.gid=dssat_all.gid and ccode={1} AND dssat_all.ensemble={2} AND fdate>={3} AND fdate<={4}""".format(
                schema, "'" + ccode + "'", int(ensemble),  "'" + startdate + "'",  "'" + enddate + "'")
        else:
            sql = """SELECT distinct DATE_PART('week',fdate) weeknumber,fdate FROM {0}.dssat_all dssat_all,{0}.dssat dssat WHERE dssat.gid=dssat_all.gid and ccode={1} AND dssat_all.ensemble={2}""".format(
                schema, "'" + ccode + "'", int(ensemble))
        cur.execute(sql)
        data = cur.fetchall()
        lai_series, lai_cum_series, lai_95series,lai_5series,gwad_series,gwad_95series,gwad_5series = parse_outlook_dssat_data(data,startdate,enddate,gid)
        return lai_series, lai_cum_series, lai_95series,lai_5series,gwad_series,gwad_95series,gwad_5series
    except Exception as e:
        print(e)
        return e

@csrf_exempt
def get_gid(cur, schema, ccode):
    try:
        sql = """select distinct x.gid from {0}.dssat_all x,{0}.agareas y,{0}.dssat z where  z.gid=x.gid and x.gid=y.gid and ccode='{1}';""".format(schema, ccode)
        cur.execute(sql)
        data = cur.fetchall()
        return data[0][0]
    except Exception as e:
        print(e)
        return e


@csrf_exempt
def get_county_name(db, gid, schema):
    conn = psycopg2.connect(
        "dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'], cfg.connection['host'],
                                                           cfg.connection['password']))
    cur = conn.cursor()
    sql = """SELECT DISTINCT cname FROM {0}.dssat WHERE ccode={1}""".format(schema, "'" + gid + "'")
    cur.execute(sql)
    data = cur.fetchall()
    return data


@csrf_exempt
def calculate_yield_main(db, schema, startdate, enddate,ensemble,gid):
    try:
        conn = psycopg2.connect(
            "dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'], cfg.connection['host'],
                                                               cfg.connection['password']))
        cur = conn.cursor()
        storename = str(db + '_' + schema + '_agareas')
        ensemble_sql = """SELECT max,ensemble,ntile(100) over(order by max) AS percentile FROM(SELECT dssat_all.ensemble,MAX(dssat_all.gwad) FROM {0}.dssat dssat,{0}.dssat_all dssat_all WHERE dssat.gid=dssat_all.gid and ccode={1} AND fdate>={2} AND fdate<={3} GROUP BY dssat_all.ensemble) as foo""".format(
            schema, "'" + gid + "'", "'" + startdate + "'", "'" + enddate + "'")
        cur.execute(ensemble_sql)
        ensemble_data = cur.fetchall()
        medianens = ensemble_data[math.ceil(len(ensemble_data) / 2) - 1]
        # sql = """SELECT gid,max(gwad) as max  FROM(SELECT gid,ensemble,max(gwad) FROM {0}.dssat GROUP BY gid,ensemble ORDER BY gid,ensemble)  as foo GROUP BY gid""".format(schema)
        if len(startdate) > 9:
            # sql="""select dss.ccode,max(avg_yield) yield,max(dss.lai) lai, x.fdate from {0}.dssat_all x,{0}.dssat dss,(select gid,max(fdate) maxdate from {0}.dssat_all where fdate>={1} and fdate<={2} group by gid) y,{0}.yield z
            #    where x.gid=y.gid and z.gid=x.gid and dss.gid=x.gid and x.fdate=y.maxdate and y.gwad<>0 group by dss.ccode,x.fdate""".format(schema,"'"+str(startdate)+"'","'"+str(enddate)+"'")
            sql = """select y.ccode,max(y.gwad),max(y.lai),max(y.fdate) from (select ccode,max(dssat_all.gwad) gwad,max(dssat_all.lai) lai,dssat_all.fdate 
                from {0}.dssat_all dssat_all,{0}.dssat dssat where dssat.gid=dssat_all.gid and fdate>={1} and fdate<={2} and dssat_all.ensemble=(
                        select ensemble from (SELECT ensemble,ntile(100) over(order by max) AS percentile FROM(SELECT dssat_all.ensemble,MAX(dssat_all.gwad) 
                        FROM {0}.dssat dat,{0}.dssat_all dssat_all 
                        WHERE dat.gid=dssat_all.gid and dat.ccode=dssat.ccode GROUP BY dssat_all.ensemble) as foo) d where percentile=20) 
                group by ccode,dssat_all.fdate)  y
                        group by y.ccode""".format(schema, "'" + startdate + "'", "'" + enddate + "'", "'" + gid + "'")
            #print(sql)

        else:
            sql = """select dss.ccode,max(avg_yield) yield,max(x.lai) lai, x.fdate from {0}.dssat_all x,{0}.dssat dss, (select gid,max(fdate) maxdate from {0}.dssat_all group by gid) y,{0}.yield z
                         where x.gid=y.gid and z.gid=x.gid and dss.gid=x.gid and x.fdate=y.maxdate group by dss.ccode,x.fdate order by x.fdate""".format(
                schema, "'" + str(startdate) + "'", "'" + str(enddate) + "'")
        # sql = """SELECT gid,avg_yield FROM {0}.yield""".format(schema)
        cur.execute(sql)
        data = cur.fetchall()

        data.sort()

        conn.close()

        return data, storename
    except Exception as e:
        print(e)
        return e


@csrf_exempt
def calculate_yield_home(db, schema, startdate, enddate):
    try:
        conn = psycopg2.connect(
            "dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'], cfg.connection['host'],
                                                               cfg.connection['password']))
        cur = conn.cursor()
        storename = str(db + '_' + schema + '_agareas')
        # sql = """SELECT gid,max(gwad) as max  FROM(SELECT gid,ensemble,max(gwad) FROM {0}.dssat GROUP BY gid,ensemble ORDER BY gid,ensemble)  as foo GROUP BY gid""".format(schema)
        if len(startdate) > 9:
            # sql="""select dss.ccode,max(avg_yield) yield,max(dss.lai) lai, x.fdate from {0}.dssat_all x,{0}.dssat dss,(select gid,max(fdate) maxdate from {0}.dssat_all where fdate>={1} and fdate<={2} group by gid) y,{0}.yield z
            #    where x.gid=y.gid and z.gid=x.gid and dss.gid=x.gid and x.fdate=y.maxdate and y.gwad<>0 group by dss.ccode,x.fdate""".format(schema,"'"+str(startdate)+"'","'"+str(enddate)+"'")
            sql = """select y.ccode,max(y.gwad),max(y.lai),max(y.fdate) from (select ccode,max(dssat_all.gwad) gwad,max(dssat_all.lai) lai,dssat_all.fdate from {0}.dssat_all dssat_all,{0}.dssat dssat where dssat.gid=dssat_all.gid and fdate>={1} and fdate<={2} and dssat_all.ensemble={3} group by ccode,dssat_all.fdate)  y
                        group by y.ccode""".format(schema, "'" + startdate + "'", "'" + enddate + "'")

        else:
            sql = """select dss.ccode,max(avg_yield) yield,max(x.lai) lai, x.fdate from {0}.dssat_all x,{0}.dssat dss, (select gid,max(fdate) maxdate from {0}.dssat_all group by gid) y,{0}.yield z
                         where x.gid=y.gid and z.gid=x.gid and dss.gid=x.gid and x.fdate=y.maxdate group by dss.ccode,x.fdate order by x.fdate""".format(
                schema, "'" + str(startdate) + "'", "'" + str(enddate) + "'")
        # sql = """SELECT gid,avg_yield FROM {0}.yield""".format(schema)
        cur.execute(sql)
        data = cur.fetchall()

        data.sort()

        conn.close()

        return data, storename
    except Exception as e:
        print(e)
        return e
@csrf_exempt
def calculate_yield(db, schema, startdate='', enddate='', API=''):
    try:
        conn = psycopg2.connect(
            "dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'], cfg.connection['host'],
                                                               cfg.connection['password']))
        cur = conn.cursor()
        storename = str(db + '_' + schema + '_agareas')
        # cat = Catalog(cfg.geoserver['rest_url'], username=cfg.geoserver['user'], password=cfg.geoserver['password'],disable_ssl_certificate_validation=True)
        # try:
        #     print('Check if the layer exists')
        #     something = cat.get_store(storename, cfg.geoserver['workspace'])
        #     if not something:
        #         print("No store")
        #         raise Exception
        #     else:
        #         print("Store exists")
        # except Exception  as e:
        #     temp_dir = tempfile.mkdtemp()
        #     pg_sql = """SELECT * FROM {0}.agareas""".format(schema)
        #     export_pg_table(temp_dir,storename,cfg.connection['host'],cfg.connection['user'],cfg.connection['password'],db ,pg_sql)
        #     target_zip = os.path.join(os.path.join(temp_dir,storename+'.zip'))
        #
        #     with zipfile.ZipFile(target_zip, 'w') as pg_zip:
        #         for f in os.listdir(os.path.join(temp_dir)):
        #             if '.zip' not in f:
        #                 f = os.path.join(temp_dir,f)
        #                 pg_zip.write(f,basename(f))
        #
        #     rest_url = cfg.geoserver['rest_url']
        #
        #     if rest_url[-1] != "/":
        #         rest_url = rest_url + '/'
        #
        #     headers = {
        #         'Content-type': 'application/zip',
        #     }
        #
        #     request_url = '{0}workspaces/{1}/datastores/{2}/file.shp'.format(rest_url,
        #                                                                              cfg.geoserver['workspace'],
        #                                                                              storename)  # Creating the rest url
        #
        #     user = cfg.geoserver['user']
        #     password = cfg.geoserver['password']
        #     requests.put(request_url, verify=False, headers=headers, data=open(target_zip,'rb'),
        #                  auth=(user, password))  # Creating the resource on the geoserver
        #
        #     if temp_dir is not None:
        #         if os.path.exists(temp_dir):
        #             print('whooo')
        #             #shutil.rmtree(temp_dir)

        # sql = """SELECT gid,max(gwad) as max  FROM(SELECT gid,ensemble,max(gwad) FROM {0}.dssat GROUP BY gid,ensemble ORDER BY gid,ensemble)  as foo GROUP BY gid""".format(schema)
        if startdate is not None and len(startdate) > 9:
            # sql="""select dss.ccode,max(avg_yield) yield,max(dss.lai) lai, x.fdate from {0}.dssat_all x,{0}.dssat dss,(select gid,max(fdate) maxdate from {0}.dssat_all where fdate>={1} and fdate<={2} group by gid) y,{0}.yield z
            #    where x.gid=y.gid and z.gid=x.gid and dss.gid=x.gid and x.fdate=y.maxdate and y.gwad<>0 group by dss.ccode,x.fdate""".format(schema,"'"+str(startdate)+"'","'"+str(enddate)+"'")
            if API == 'API':
                sql = """select y.ccode,max(y.gwad),max(y.fdate) from (select ccode,max(dssat_all.gwad) gwad,max(dssat_all.lai) lai,dssat_all.fdate from {0}.dssat_all dssat_all,{0}.dssat dssat where dssat.gid=dssat_all.gid and fdate>={1} and fdate<={2} group by ccode,dssat_all.fdate)  y
                                        group by y.ccode""".format(schema, "'" + startdate + "'", "'" + enddate + "'")
            else:
                sql = """select y.ccode,max(y.gwad),max(y.lai),max(y.fdate) from (select ccode,max(dssat_all.gwad) gwad,max(dssat_all.lai) lai,dssat_all.fdate from {0}.dssat_all dssat_all,{0}.dssat dssat where dssat.gid=dssat_all.gid and fdate>={1} and fdate<={2} group by ccode,dssat_all.fdate)  y
                        group by y.ccode""".format(schema, "'" + startdate + "'", "'" + enddate + "'")

        else:

            # sql = """select dss.ccode,max(avg_yield) yield,max(x.lai) lai, x.fdate from {0}.dssat_all x,{0}.dssat dss, (select gid,max(fdate) maxdate from {0}.dssat_all group by gid) y,{0}.yield z
            #              where x.gid=y.gid and z.gid=x.gid and dss.gid=x.gid and x.fdate=y.maxdate group by dss.ccode,x.fdate order by x.fdate""".format(
            #     schema, "'" + str(startdate) + "'", "'" + str(enddate) + "'")
            # for API call external
            sql = """SELECT ccode,avg(max) as max  FROM(SELECT ccode,ensemble,max(gwad) FROM {0}.dssat GROUP BY ccode,ensemble ORDER BY ccode,ensemble)  as foo GROUP BY ccode""".format(
                schema)
        # sql = """SELECT gid,avg_yield FROM {0}.yield""".format(schema)
        cur.execute(sql)
        data = cur.fetchall()

        data.sort()

        conn.close()

        return data, storename
    except Exception as e:
        print(e)
        return e


@csrf_exempt
def calculate_yield_gid(db, schema, gid, startdate, enddate):
    try:
        conn = psycopg2.connect(
            "dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'], cfg.connection['host'],
                                                               cfg.connection['password']))
        cur = conn.cursor()
        ensemble_sql = """SELECT max,ensemble,ntile(100) over(order by max) AS percentile FROM(SELECT dssat_all.ensemble,MAX(dssat_all.gwad) FROM {0}.dssat dssat,{0}.dssat_all dssat_all WHERE dssat.gid=dssat_all.gid and ccode={1} AND fdate>={2} AND fdate<={3} GROUP BY dssat_all.ensemble) as foo""".format(
            schema, "'" + gid + "'", "'"+startdate+"'", "'"+enddate+"'")
        cur.execute(ensemble_sql)
        ensemble_data = cur.fetchall()
        medianens = ensemble_data[math.ceil(len(ensemble_data) / 2) - 1]
        yield_sql = """SELECT max(dssat_all.gwad) FROM {0}.dssat_all dssat_all,{0}.dssat dssat WHERE dssat.gid=dssat_all.gid and ccode={1} AND dssat_all.ensemble={2} AND fdate>={3} AND fdate<={4} GROUP BY ccode;""".format(
            schema, "'" + gid + "'", int(medianens[1]), "'"+startdate+"'", "'"+enddate+"'")
        #print(yield_sql)
        cur.execute(yield_sql)
        yield_data = cur.fetchall()

        yield_data.sort()
        county_sql = """SELECT DISTINCT cname FROM {0}.dssat WHERE ccode={1}""".format(schema, "'" + gid + "'")
        cur.execute(county_sql)
        county_data = cur.fetchall()
        conn.close()

        return yield_data, county_data
    except Exception as e:
        print(e)
        return e


@csrf_exempt
def get_vic_polygon_working(s_var, geom_data, sd, ed):
    poly_geojson = Polygon(json.loads(geom_data))
    shape_obj = shapely.geometry.asShape(poly_geojson)
    try:
        nuts = gpd.GeoDataFrame({'geometry': json.loads(geom_data)})

        nuts.head()

        d = xarray.open_mfdataset(os.path.join(cfg.data['path'], s_var + "_final.nc"), chunks={'time': 10})
        # d = d.assign_coords(longitude=(((d.lon + 180) % 360) - 180)).sortby('lon')
        # nuts_mask_poly = regionmask.Regions_cls(name='nuts_mask', numbers=list(range(0, 37)), names=list(nuts.id),
        #                                         abbrevs=list(nuts.ccode),
        #                                         outlines=list(nuts.geometry.values[i] for i in range(0, 37)))

        ds = rioxarray.open_rasterio(
            os.path.join(cfg.data['path'], s_var + "_final.nc"),
            masked=True,
            chunks=True,
        )
        clipped = ds.rio.clip(geometries=poly_geojson, crs=4326)
        print('.............................')
    except Exception as e:
        print(e)
    print(clipped)


@csrf_exempt
def get_vic_polygon(s_var, geom_data, sd, ed):
    json_obj = {}
    # Defining the lat and lon from the coords string
    poly_geojson = Polygon(json.loads(geom_data))
    shape_obj = shapely.geometry.asShape(poly_geojson)
    bounds = poly_geojson.bounds
    miny = float(bounds[0])
    minx = float(bounds[1])
    maxy = float(bounds[2])
    maxx = float(bounds[3])
    ks_sat3 = xarray.open_dataset(os.path.join(cfg.data['path'], s_var + "_final.nc"))
    arr = ks_sat3[s_var].sel(time=slice(sd, ed)).sel(lon=slice(miny, maxy), lat=slice(minx, maxx)).mean(
        dim=['lat', 'lon'])
    # print(arr.time.values)
    # print(arr.values)
    vals = arr.values.tolist()
    values = [0 if ((s_var == 'prec' or s_var == 'evap') and float(val) < 0) else round(float(val), 3) for val in vals]
    times2 = arr['time'].dt.strftime('%Y-%m-%d %H:%M:%S').values.tolist()
    times1 = [datetime.strptime(t, '%Y-%m-%d %H:%M:%S') for t in times2]
    times = [(calendar.timegm(st.utctimetuple()) * 1000) for st in times1]
    ts_plot = [[i, j] for i, j in zip(times, values)]
    return ts_plot


@csrf_exempt
def get_vic_polygon_old(s_var, geom_data, sd, ed):
    ts_plot = []
    json_obj = {}
    # Defining the lat and lon from the coords string
    poly_geojson = Polygon(json.loads(geom_data))
    shape_obj = shapely.geometry.asShape(poly_geojson)
    bounds = poly_geojson.bounds
    miny = float(bounds[0])
    minx = float(bounds[1])
    maxy = float(bounds[2])
    maxx = float(bounds[3])
    # print("get vic poly")
    # print(minx)
    # print(maxx)
    # print(miny)
    # print(maxy)
    """Make sure you have this path for all the run_types(/home/tethys/rheas/varname.nc)"""
    infile = os.path.join(cfg.data['path'], s_var + "_final.nc")
    nc_fid = netCDF4.Dataset(infile, 'r', )  # Reading the netCDF file
    lis_var = nc_fid.variables
    field = nc_fid.variables[s_var][:]
    lats = nc_fid.variables['lat'][:]
    lons = nc_fid.variables['lon'][:]  # Defining the longitude array
    time = nc_fid.variables['time'][:]
    latli = np.argmin(np.abs(lats - minx))
    latui = np.argmin(np.abs(lats - maxx))

    lonli = np.argmin(np.abs(lons - miny))
    lonui = np.argmin(np.abs(lons - maxy))
    for timestep, v in enumerate(time):
        val = field[timestep][latli:latui, lonli:lonui]
        val = np.mean(val)
        if np.isnan(val) == False:
            dt_str = netCDF4.num2date(lis_var['time'][timestep], units=lis_var['time'].units,
                                      calendar=lis_var['time'].calendar)
            startdate = datetime.strptime(sd + ' 00:00:00', '%Y-%m-%d %H:%M:%S')
            enddate = datetime.strptime(ed + ' 00:00:00', '%Y-%m-%d %H:%M:%S')
            if dt_str >= startdate and dt_str <= enddate:
                st = dt_str.strftime('%Y-%m-%d %H:%M:%S')
                stt = datetime.strptime(st, '%Y-%m-%d %H:%M:%S')

                time_stamp = calendar.timegm(stt.utctimetuple()) * 1000
                if (s_var == 'prec' or s_var == 'evap') and float(val) < 0:
                    val = 0
                else:
                    val = round(float(val), 3)
                ts_plot.append([time_stamp, float(val)])
    ts_plot.sort()
    # geom = [round(minx, 2), round(miny, 2), round(maxx, 2), round(maxy, 2)]
    # json_obj["plot"] = ts_plot
    # json_obj["geom"] = geom
    return ts_plot


@csrf_exempt
def get_times(variable):
    times = []
    infile = os.path.join(cfg.data['path'], variable + "_final.nc")

    nc_fid = netCDF4.Dataset(infile, 'r', )  # Reading the netCDF file
    time = nc_fid.variables['time'][:]
    lis_var = nc_fid.variables
    for timestep, v in enumerate(time):
        try:
            dt_str = netCDF4.num2date(lis_var['time'][timestep], units=lis_var['time'].units,
                                      calendar=lis_var['time'].calendar)
            # times.append(datetime.strptime(dt_str, '%Y-%m-%d'))
            times.append(str(dt_str)[0:10])

        except:
            pass
    return times


@csrf_exempt
def get_start_end(db):
    dates=[]
    try:
        conn = psycopg2.connect("dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'], cfg.connection['host'],
                                                               cfg.connection['password']))
        cur = conn.cursor()
        sql = """select min(planting),max(last_harvest) from {0}.yield""".format(db)
        cur.execute(sql)
        data = cur.fetchall()
        conn.close()
        return data
    except Exception as e:
        print(e)
        return e
