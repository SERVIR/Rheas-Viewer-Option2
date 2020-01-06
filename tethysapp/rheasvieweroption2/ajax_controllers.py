from django.http import JsonResponse, HttpResponse, Http404
from tethysapp.rheasvieweroption2.model import *
import requests
import tethysapp.rheasvieweroption2.config as cfg
import xmltodict
from django.views.decorators.csrf import csrf_exempt

def get_db_schemas(request):
    return_obj = {}

    if request.is_ajax() and request.method == 'POST':
        try:
            info = request.POST
            db = info.get("db")
            schemas = get_schemas(db)


            return_obj["schemas"] = schemas
            return_obj["success"] = "success"


        except Exception as e:
            return_obj["error"] = e

        return JsonResponse(return_obj)

def get_vars(request):
    return_obj = {}

    if request.is_ajax() and request.method == 'POST':

        try:
            info = request.POST
            db = info.get("db")
            region = info.get("region")
            variables = get_variables(db,region)


            return_obj["variables"] = variables
            return_obj["success"] = "success"
            return_obj["region"]  = region

        except Exception as e:
            return_obj["error"] = e
        return JsonResponse(return_obj)
@csrf_exempt
def get_dates(request):
    return_obj = {}

    if request.is_ajax() and request.method == 'POST':

        info = request.POST
        db = info.get("db")
        variable = info.get("variable")
        region = info.get("region")

        try:
            dates = get_times(db,region, variable)

            return_obj["variable"] = variable
            return_obj["region"] = region
            return_obj["dates"] = dates
            return_obj["success"] = "success"

        except Exception as e:
            return_obj["error"] = e
        return JsonResponse(return_obj)
@csrf_exempt
def get_raster(request):
    return_obj = {}

    if request.is_ajax() and request.method == 'POST':

        info = request.POST
        db = info.get("db")
        variable = info.get("variable")
        region = info.get("region")
        date = info.get("date")
        try:
            storename, mean, stddev, min, max = get_selected_raster(db,region,variable,date)
            color_range = calc_color_range(min,max)

            return_obj["storename"] = storename
            return_obj["mean"] = mean
            return_obj["stddev"] = stddev
            return_obj["min"] = min
            return_obj["max"] = max
            return_obj["scale"] = color_range
            return_obj["variable"] = variable
            return_obj["region"] = region
            return_obj["date"] = date
            return_obj["success"] = "success"
            return JsonResponse(return_obj)

        except Exception as e:
            return_obj["error"] = str(e)+ " From ajax"
            return JsonResponse(return_obj)

@csrf_exempt
def get_scale(request):
    return_obj = {}

    if request.is_ajax() and request.method == 'POST':

        info = request.POST
        min = info.get("min")
        max = info.get("max")
        try:
            color_range = calc_color_range1(float(min),float(max))
            return_obj["scale"] = color_range
            return_obj["success"] = "success"
            return JsonResponse(return_obj)

        except Exception as e:
            return_obj["error"] = str(e)+ " From ajax"
            return JsonResponse(return_obj)

@csrf_exempt
def get_vector(request):
    return_obj = {}

    if request.is_ajax() and request.method == 'POST':

        info = request.POST
        db = info.get("db")
        variable = info.get("variable")
        region = info.get("region")
        date = info.get("date")
        try:
            storename, mean, stddev, min, max = get_selected_raster(db,region,variable,date)
            color_range = calc_color_range(min,max)

            return_obj["storename"] = storename
            return_obj["mean"] = mean
            return_obj["stddev"] = stddev
            return_obj["min"] = min
            return_obj["max"] = max
            return_obj["scale"] = color_range
            return_obj["variable"] = variable
            return_obj["region"] = region
            return_obj["date"] = date
            return_obj["success"] = "success"
            return JsonResponse(return_obj)

        except Exception as e:
            return_obj["error"] = str(e)+ " From ajax"
            return JsonResponse(return_obj)

@csrf_exempt
def get_vic_plot(request):
    return_obj = {}
    context = {}

    if request.is_ajax() and request.method == 'POST':
        info = request.POST

        db = info.get("db")
        variable = info.get("variable")
        region = info.get("region")
        return_obj["variable"] = variable
        return_obj["region"] = region

        point = request.POST['point']
        polygon = request.POST['polygon']

        if point:
            try:
                mean, stddev, min, max, time_series = get_vic_point(db,region,variable,point)
                return_obj["mean"] = mean
                return_obj["stddev"] = stddev
                return_obj["min"] = min
                return_obj["max"] = max
                return_obj["point"] = point
                return_obj["time_series"] = time_series
                return_obj["variable"] = variable
                return_obj["interaction"] = "point"
                return_obj["success"] = "success"
                return JsonResponse(return_obj)

            except Exception as e:
                return_obj["error"] = "Error Retrieving Data"
                return JsonResponse(return_obj)

        if polygon:
            try:
                mean, stddev, min, max, time_series = get_vic_polygon(db,region,variable,polygon)
                return_obj["mean"] = mean
                return_obj["stddev"] = stddev
                return_obj["min"] = min
                return_obj["max"] = max
                return_obj["point"] = point
                return_obj["time_series"] = time_series
                return_obj["variable"] = variable
                return_obj["interaction"] = "polygon"
                return_obj["success"] = "success"
                return JsonResponse(return_obj)

            except Exception as e:
                return_obj["error"] = "Error Retrieving Data"
                return JsonResponse(return_obj)



def get_dssat_schemas(request):
    return_obj = {}

    if request.is_ajax() and request.method == 'POST':
        info = request.POST

        db = info.get("db")

        schemas = check_dssat_schema(db)

        return_obj["schemas"] = schemas
        return_obj["success"] = "success"

        return JsonResponse(return_obj)

def get_ensemble(request):
    return_obj = {}

    if request.is_ajax() and request.method == 'POST':
        info = request.POST

        db = info.get("db")
        gid = info.get("gid")
        schema = info.get("schema")

        ensembles = get_dssat_ensemble(db,gid,schema)
        return_obj["gid"] = gid
        return_obj["schema"] = schema
        return_obj["ensembles"] = ensembles
        return_obj["success"] = "success"

        return JsonResponse(return_obj)
@csrf_exempt
def get_ens_values(request):
    return_obj = {}

    if request.is_ajax() and request.method == 'POST':
        info = request.POST

        try:
            db = info.get("db")
            gid = info.get("gid")
            schema = info.get("schema")
            ensemble = info.get("ensemble")
            startdate = info.get("startdate")
            enddate = info.get("enddate")
            # if "avg" in ensemble:


            wsgd_series,lai_series,gwad_series,low_gwad_series,high_gwad_series,ensemble_info = get_dssat_values(db,gid,schema,ensemble,startdate,enddate)

            return_obj["gid"] = gid
            return_obj["schema"] = schema
            return_obj["ensemble"] = ensemble
            return_obj["wsgd_series"] = wsgd_series
            return_obj["lai_series"] = lai_series
            return_obj["gwad_series"] = gwad_series
            return_obj["low_gwad_series"] = low_gwad_series
            return_obj["high_gwad_series"] = high_gwad_series
            return_obj["ensemble_info"] = ensemble_info
            return_obj["success"] = "success"
            print("_________________")
            print(return_obj)
            return JsonResponse(return_obj)
            # else:
            #     wsgd_series, lai_series, gwad_series = get_dssat_values(db,gid, schema, ensemble)
            #     return_obj["gid"] = gid
            #     return_obj["schema"] = schema
            #     return_obj["ensemble"] = ensemble
            #     return_obj["wsgd_series"] = wsgd_series
            #     return_obj["lai_series"] = lai_series
            #     return_obj["gwad_series"] = gwad_series
            #     return_obj["success"] = "success"
            #     return JsonResponse(return_obj)

        except Exception as e:

            return_obj["error"] = "error"
            return JsonResponse(return_obj)

@csrf_exempt
def get_county(request):
    return_obj = {}

    if request.is_ajax() and request.method == 'POST':
        info = request.POST

        try:
            db = info.get("db")
            gid = info.get("gid")
            schema = info.get("schema")
            return_obj["county"] = get_county_name(db,gid,schema)
            return_obj["success"] = "success"
            return JsonResponse(return_obj)

        except Exception as e:

            return_obj["error"] = "error"
            return JsonResponse(return_obj)


@csrf_exempt
def get_schema_yield(request):
    return_obj = {}

    if request.is_ajax() and request.method == 'POST':
        info = request.POST

        db = info.get("db")

        schema = info.get("schema")

        yield_data,storename = calculate_yield(db,schema)


        return_obj["storename"] = storename
        return_obj["yield"] = yield_data
        return_obj["schema"] = schema
        return_obj["success"] = "success"

        return JsonResponse(return_obj)

@csrf_exempt
def get_bounds(request):
    
    return_obj = {}
    
    if request.is_ajax() and request.method == 'POST':
        info = request.POST
        type = info.get('type')
        rest_url = info.get('url')
        store = info.get('store')
        workspace = info.get('workspace')

        xml_url = None

        if type == 'raster':
            xml_url = str(rest_url)+'workspaces/'+str(workspace)+'/coveragestores/'+str(store)+'/coverages/'+str(store)+'.xml'
            r = requests.get(xml_url, auth=(cfg.geoserver['user'], cfg.geoserver['password']))
            r_json = xmltodict.parse(r.content)
            bbox = r_json['coverage']['latLonBoundingBox']
            bounds = [float(bbox['minx']), float(bbox['miny']), float(bbox['maxx']), float(bbox['maxy'])]
            return_obj["bounds"] = bounds
            return_obj["success"] = "success"

        if type =='vector':
            xml_url = str(rest_url) + 'workspaces/' + str(workspace) + '/datastores/' + str(store) + '/featuretypes/' + str(store) + '.xml'
            r = requests.get(xml_url, auth=(cfg.geoserver['user'], cfg.geoserver['password']))
            r_json = xmltodict.parse(r.content)
            bbox = r_json['featureType']['latLonBoundingBox']
            bounds = [float(bbox['minx'])-1.5, float(bbox['miny']), float(bbox['maxx'])-1.5, float(bbox['maxy'])]
            return_obj["bounds"] = bounds
            return_obj["success"] = "success"

        return JsonResponse(return_obj)
    
    
        

