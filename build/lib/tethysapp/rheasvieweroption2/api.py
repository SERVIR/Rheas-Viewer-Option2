from django.http import JsonResponse
import json
from tethysapp.rheasvieweroption2.model import *
def api_get_dbs(request):
    return_obj = {}

    if request.method == 'GET':
        try:
            info = request.GET
            rheas_dbs = get_database()


            return_obj["rheas_dbs"] = rheas_dbs
            return_obj["success"] = "success"


        except Exception as e:
            return_obj["error"] = e

        return JsonResponse(return_obj)

def api_get_db_schemas(request):
    return_obj = {}

    if request.method == 'GET':
        try:
            info = request.GET
            db = info.get("db")
            schemas = get_schemas(db)


            return_obj["schemas"] = schemas
            return_obj["success"] = "success"


        except Exception as e:
            return_obj["error"] = e

        return JsonResponse(return_obj)

def api_get_vars(request):
    return_obj = {}

    if request.method == 'GET':

        try:
            info = request.GET
            db = info.get("db")
            schema = info.get("schema")
            variables = get_variables(db,schema)

            return_obj["variables"] = variables
            return_obj["success"] = "success"
            return_obj["schema"]  = schema

        except Exception as e:
            return_obj["error"] = e

        return JsonResponse(return_obj)

def api_get_dates(request):
    return_obj = {}

    if request.method == 'GET':

        info = request.GET
        db = info.get("db")
        variable = info.get("variable")
        schema = info.get("schema")

        try:
            dates = get_times(db,schema, variable)

            return_obj["variable"] = variable
            return_obj["schema"] = schema
            return_obj["dates"] = dates
            return_obj["success"] = "success"

        except Exception as e:
            return_obj["error"] = e

        return JsonResponse(return_obj)

def api_get_vic_plot(request):
    return_obj = {}
    context = {}

    if request.method == 'POST':
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

def api_get_dssat_schemas(request):
    return_obj = {}

    if request.method == 'GET':
        try:

            info = request.GET

            db = info.get("db")

            schemas = check_dssat_schema(db)

            return_obj["schemas"] = schemas
            return_obj["success"] = "success"
        except Exception as e:
            return_obj["error"] = e

        return JsonResponse(return_obj)

def api_get_dssat_gid(request):
    return_obj = {}

    if request.method == 'GET':
        try:

            info = request.GET

            db = info.get("db")
            schema = info.get("schema")
            gids = get_dssat_gid(db,schema)


            return_obj["db"] = db
            return_obj["schema"] = schema
            return_obj["gids"] = gids
            return_obj["success"] = "success"
        except Exception as e:
            return_obj["error"] = e

        return JsonResponse(return_obj)

def api_get_ensemble(request):
    return_obj = {}

    if request.method == 'GET':

        try:
            info = request.GET

            db = info.get("db")
            gid = info.get("gid")
            schema = info.get("schema")

            ensembles = get_dssat_ensemble(db,gid,schema)
            return_obj["gid"] = gid
            return_obj["schema"] = schema
            return_obj["ensembles"] = ensembles
            return_obj["success"] = "success"

        except Exception as e:
            return_obj["error"] = e

        return JsonResponse(return_obj)

def api_get_ens_values(request):
    return_obj = {}

    if request.method == 'GET':
        info = request.GET

        try:
            db = info.get("db")
            gid = info.get("gid")
            schema = info.get("schema")
            ensemble = info.get("ensemble")
            if "avg" in ensemble:
                wsgd_series,lai_series,gwad_series,low_gwad_series,high_gwad_series,ensemble_info = get_dssat_values(db,gid,schema,ensemble)
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

                return JsonResponse(return_obj)
            else:
                wsgd_series, lai_series, gwad_series = get_dssat_values(db,gid, schema, ensemble)
                return_obj["gid"] = gid
                return_obj["schema"] = schema
                return_obj["ensemble"] = ensemble
                return_obj["wsgd_series"] = wsgd_series
                return_obj["lai_series"] = lai_series
                return_obj["gwad_series"] = gwad_series
                return_obj["success"] = "success"
                return JsonResponse(return_obj)

        except Exception as e:

            return_obj["error"] = "error"

            return JsonResponse(return_obj)


def api_get_schema_yield(request):
    return_obj = {}

    if request.method == 'GET':

        try:

            info = request.GET

            db = info.get("db")

            schema = info.get("schema")

            yield_data,storename = calculate_yield(db,schema)


            return_obj["storename"] = storename
            return_obj["yield"] = yield_data
            return_obj["schema"] = schema
            return_obj["success"] = "success"


        except Exception as e:

            return_obj["error"] = "error"

        return JsonResponse(return_obj)

