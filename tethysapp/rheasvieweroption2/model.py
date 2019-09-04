import psycopg2
import json
from tethysapp.rheasvieweroption2.utilities import *
import math
import tethysapp.rheasvieweroption2.config as cfg
from geoserver.catalog import Catalog
import geoserver
import requests
import logging
import tempfile, shutil,os,sys, zipfile
from os.path import basename

default_schemas = ['basin','crops','dssat','ken_test','information_schema','lai','precip','public','soilmoist','test','test_ke','test_tza','tmax','tmin','topology','vic','wind','pg_toast','pg_temp_1','pg_toast_temp_1','pg_catalog','ken_vic','tza_vic','eth_vic','tza_nrt']

# logging.basicConfig(filename='darwin.log',level=logging.INFO)

def get_selected_raster(db,region,variable,date):
    # logging.info(str(region)+','+str(variable)+','+str(date))
    try:
        # logging.info('Connecting to the database')
        conn = psycopg2.connect("dbname={0} user={1} host={2} password={3}".format(db,cfg.connection['user'],cfg.connection['host'],cfg.connection['password']))
        cur = conn.cursor()

        storename = db+'_'+region+'_'+variable+'_'+date

        cat = Catalog(cfg.geoserver['rest_url'], username=cfg.geoserver['user'], password=cfg.geoserver['password'],disable_ssl_certificate_validation=True)

        try:
            # logging.info('Check if the layer exists')
            something = cat.get_store(storename,cfg.geoserver['workspace'])
            if not something:
		# logging.info('Layer doesnt exist')
                print( "No store")
                raise Exception
            else:
                mean, stddev, min, max = get_vic_summary(db,region, variable, date)
                # logging.info(str(mean)+str(stddev)+str(min)+str(max))
                return storename, mean, stddev, min, max
        except Exception  as e:
            # logging.info('Entering geoserver code')
	    # logging.error('Error at failed request ' + str(e))
            try:
                # logging.info('Starting the geoserver stuff')
                sql = """SELECT ST_AsGDALRaster(rast, 'GTiff') as tiff FROM {0}.{1} WHERE id={2}""".format(region, variable, date)
                cur.execute(sql)
                data = cur.fetchall()
                # logging.info(str(data))

                mean, stddev, min, max = get_vic_summary(db,region, variable, date)
                # logging.info('Work you piece ...')
                rest_url = cfg.geoserver['rest_url']
                # logging.info(str(rest_url))

                if rest_url[-1] != "/":
                    rest_url = rest_url + '/'

                headers = {
                    'Content-type': 'image/tiff',
                }

                request_url = '{0}workspaces/{1}/coveragestores/{2}/file.geotiff'.format(rest_url,
                                                                                         cfg.geoserver['workspace'],
                                                                                         storename)  # Creating the rest url
                # logging.info('Get the username and password')
                user = cfg.geoserver['user']
                password = cfg.geoserver['password']
                # logging.info('Right before the put command')
                requests.put(request_url,verify=False,headers=headers, data=data[0][0],
                                 auth=(user, password))  # Creating the resource on the geoserver

                # logging.info(request_url)
                return storename, mean, stddev, min, max

            except Exception as er:
		# logging.info('Error at uplaoding tiff '+ str(e))
                return str(er)+' This is while adding the raster layer.'

    except Exception as err:
        # logging.info(str(err) + ' This is generic catch all')
        return str(err)+ ' This is the generic one'

def get_vic_summary(db,region,variable,date):

    try:
        conn = psycopg2.connect("dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'],cfg.connection['host'], cfg.connection['password']))
        cur = conn.cursor()

        sql2 = """SELECT ST_SummaryStats(rast,1,TRUE) as stats FROM {0}.{1} WHERE id={2}""".format(region, variable,
                                                                                                   date)
        cur.execute(sql2)
        data = cur.fetchall()[0][0]
        summary = data.strip("(").strip(")").split(',')
        count = summary[0]
        mean = round(float(summary[2]), 3)
        stddev = round(float(summary[3]), 3)
        min = round(float(summary[4]), 3)
        max = round(float(summary[5]), 3)

        conn.close()

        return mean,stddev,min,max
    except Exception as e:
        print(e)
        return e

def get_vic_point(db,region,variable,point):

    try:
        conn = psycopg2.connect("dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'],cfg.connection['host'], cfg.connection['password']))
        cur = conn.cursor()

        ssql = """SELECT ST_SummaryStatsAgg(rast, 1, TRUE) AS stats FROM {0}.{1}""".format(region,variable)
        cur.execute(ssql)
        data = cur.fetchall()[0][0]
        summary = data.strip("(").strip(")").split(',')
        count = summary[0]
        mean = round(float(summary[2]), 3)
        stddev = round(float(summary[3]), 3)
        min = round(float(summary[4]), 3)
        max = round(float(summary[5]), 3)
        coords = point.split(',')
        lat = round(float(coords[1]),2)
        lon = round(float(coords[0]),2)
        psql = """SELECT  fdate,ST_Value(rast, 1, ST_SetSRID(ST_Point({0},{1}), 4326)) as b1 FROM {2}.{3} WHERE ST_Intersects(rast, ST_SetSRID(ST_Point({0},{1}), 4326)::geometry, 1)""".format(lon,lat,region,variable)

        cur.execute(psql)
        ts = cur.fetchall()

        time_series = []
        for item in ts:
            time_stamp = time.mktime(datetime.strptime(str(item[0]), "%Y-%m-%d").timetuple()) * 1000
            val = round(item[1], 3)
            time_series.append([time_stamp, val])

        time_series.sort()

        conn.close()

        return mean,stddev,min,max,time_series

    except Exception as e:
        print( e)
        return e

def get_vic_polygon(db,region,variable,polygon):

    try:
        conn = psycopg2.connect("dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'],cfg.connection['host'], cfg.connection['password']))
        cur = conn.cursor()

        ssql = "SELECT ST_SummaryStatsAgg(rast, 1, TRUE) AS stats FROM {0}.{1}".format(region,variable)
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
            coord = str(item[0])+' '+str(item[1])+','
            polygon_str += coord

        polygon_str = polygon_str[:-1]
        poly_sql = """SELECT fdate, CAST(AVG(((foo.geomval).val)) AS decimal(9,3)) as avgimr FROM (SELECT fdate, ST_Intersection(rast,ST_GeomFromText('POLYGON(({0}))',4326)) AS geomval FROM {1}.{2} WHERE ST_Intersects(ST_GeomFromText('POLYGON(({0}))',4326), rast)) AS foo GROUP BY fdate ORDER BY fdate""".format(polygon_str,region,variable)
        cur.execute(poly_sql)
        poly_ts = cur.fetchall()
        time_series = []
        for item in poly_ts:
            time_stamp = time.mktime(datetime.strptime(str(item[0]), "%Y-%m-%d").timetuple()) * 1000
            val = round(item[1], 3)
            time_series.append([time_stamp, val])

        time_series.sort()
        conn.close()

        return mean, stddev, min, max, time_series
    except Exception as e:
        print(e)
        return e

def get_database():
    try:
        conn = psycopg2.connect(user=cfg.connection['user'],host= cfg.connection['host'],password=cfg.connection['password'])
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

def get_schemas(db):
    try:
        conn = psycopg2.connect("dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'],cfg.connection['host'], cfg.connection['password']))
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

def get_variables(db,region):

    try:
        conn = psycopg2.connect("dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'],cfg.connection['host'], cfg.connection['password']))
        cur = conn.cursor()
        sql = """SELECT table_name FROM information_schema.tables WHERE table_schema = '{0}'""".format(region)

        cur.execute(sql)
        data = cur.fetchall()

        variables = [var[0] for var in data if var[0] != "basin" if var[0] != "agareas" if var[0] != "state" if var[0] != "dssat" if var[0] != "yield"]
        variables.sort()
        conn.close()

        return variables
    except Exception as e:
        print(e)
        return e

def get_times(db,region,variable):

    try:
        conn = psycopg2.connect("dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'],cfg.connection['host'], cfg.connection['password']))
        cur = conn.cursor()
        sql = """SELECT fdate,id FROM {0}.{1}""".format(region,variable)

        cur.execute(sql)
        data = cur.fetchall()

        dates = [[datetime.strftime(date, "%Y-%m-%d"),id] for date,id in data]
        dates.sort()
        conn.close()
        return dates
    except Exception as e:
        print(e)
        return e

def export_pg_table(export_path, pgtable_name, host, username, password, db, pg_sql_select):

    cmd = '''/home/Socrates/spulla/tethys/miniconda/envs/tethys/bin/ogr2ogr -overwrite -f \"ESRI Shapefile\" {export_path}/{pgtable_name}.shp PG:"host={host} user={username} dbname={db} password={password}" -sql "{pg_sql_select}"'''.format(
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



def get_dssat_ensemble(db,gid,schema):


    try:
        conn = psycopg2.connect("dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'],cfg.connection['host'], cfg.connection['password']))
        cur = conn.cursor()


        sql = """SELECT DISTINCT ensemble FROM {0}.dssat WHERE gid={1} ORDER BY ensemble;""".format(schema,int(gid))

        cur.execute(sql)
        data = cur.fetchall()
        ensembles = [ens[0] for ens in data]
        conn.close()

        return ensembles
    except Exception as e:
        print(e)
        return e

def get_dssat_gid(db,schema):


    try:
        conn = psycopg2.connect("dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'],cfg.connection['host'], cfg.connection['password']))
        cur = conn.cursor()


        sql = """SELECT DISTINCT gid FROM {0}.dssat;""".format(schema)

        cur.execute(sql)
        data = cur.fetchall()
        print(data)
        gids = [gid[0] for gid in data]
        conn.close()

        return gids
    except Exception as e:
        print(e)
        return e

def get_dssat_values(db,gid,schema,ensemble):


    try:
        conn = psycopg2.connect("dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'],cfg.connection['host'], cfg.connection['password']))

        cur = conn.cursor()

        if "avg" in ensemble:
            sql1 = """SELECT max,ensemble,ntile(100) over(order by max) AS percentile FROM(SELECT ensemble,MAX(gwad) FROM {0}.dssat WHERE gid={1} GROUP BY ensemble) as foo""".format(schema,int(gid))

            cur.execute(sql1)
            data1 = cur.fetchall()
            print(data1)
            medianens = data1[math.ceil(len(data1)/2) - 1]
            lowens = data1[math.ceil(len(data1)/4) - 1]
            highens = data1[math.ceil(len(data1)* 3/4) - 1]

            med_wsgd_series, med_lai_series, med_gwad_series = get_dssat_ens_values(cur,gid,schema,medianens[1])
            low_wsgd_series, low_lai_series, low_gwad_series = get_dssat_ens_values(cur, gid, schema, lowens[1])
            high_wsgd_series, high_lai_series, high_gwad_series = get_dssat_ens_values(cur, gid, schema, highens[1])
            ensemble_info = [lowens[1],medianens[1],highens[1]]
            conn.close()
            return med_wsgd_series, med_lai_series, med_gwad_series,low_gwad_series,high_gwad_series,ensemble_info
        else:

            wsgd_series, lai_series, gwad_series = get_dssat_ens_values(cur,gid,schema,ensemble)
            conn.close()
            return wsgd_series, lai_series, gwad_series

    except Exception as e:

        return e

def get_dssat_ens_values(cur,gid,schema,ensemble):
    sql = """SELECT fdate,wsgd,lai,gwad FROM {0}.dssat_all WHERE gid={1} AND ensemble={2} ORDER BY fdate;""".format(
        schema, int(gid), int(ensemble))

    cur.execute(sql)
    data = cur.fetchall()
    wsgd_series, lai_series, gwad_series = parse_dssat_data(data)

    return wsgd_series, lai_series, gwad_series

def calculate_yield(db,schema):

    try:
        conn = psycopg2.connect(
            "dbname={0} user={1} host={2} password={3}".format(db, cfg.connection['user'], cfg.connection['host'],
                                                               cfg.connection['password']))
        cur = conn.cursor()
        storename = db+'_'+schema+'_agareas'

        cat = Catalog(cfg.geoserver['rest_url'], username=cfg.geoserver['user'], password=cfg.geoserver['password'],disable_ssl_certificate_validation=True)
        try:
            print('Check if the layer exists')
            something = cat.get_store(storename, cfg.geoserver['workspace'])
            if not something:
                print("No store")
                raise Exception
            else:

                print("Store exists")
        except Exception  as e:
            temp_dir = tempfile.mkdtemp()
            pg_sql = """SELECT * FROM {0}.agareas""".format(schema)

            export_pg_table(temp_dir,storename,cfg.connection['host'],cfg.connection['user'],cfg.connection['password'],db,pg_sql)
            target_zip = os.path.join(os.path.join(temp_dir,storename+'.zip'))

            with zipfile.ZipFile(target_zip, 'w') as pg_zip:
                for f in os.listdir(os.path.join(temp_dir)):
                    if '.zip' not in f:
                        f = os.path.join(temp_dir,f)
                        pg_zip.write(f,basename(f))

            rest_url = cfg.geoserver['rest_url']

            if rest_url[-1] != "/":
                rest_url = rest_url + '/'

            headers = {
                'Content-type': 'application/zip',
            }

            request_url = '{0}workspaces/{1}/datastores/{2}/file.shp'.format(rest_url,
                                                                                     cfg.geoserver['workspace'],
                                                                                     storename)  # Creating the rest url

            user = cfg.geoserver['user']
            password = cfg.geoserver['password']
            requests.put(request_url, verify=False, headers=headers, data=open(target_zip,'rb'),
                         auth=(user, password))  # Creating the resource on the geoserver

            if temp_dir is not None:
                if os.path.exists(temp_dir):
                    print('whooo')
                    #shutil.rmtree(temp_dir)

        sql = """SELECT gid,avg(max) as max  FROM(SELECT gid,ensemble,max(gwad) FROM {0}.dssat GROUP BY gid,ensemble ORDER BY gid,ensemble)  as foo GROUP BY gid""".format(schema)

        cur.execute(sql)
        data = cur.fetchall()

        data.sort()

        conn.close()

        return data,storename
    except Exception as e:
        print(e)
        return e
