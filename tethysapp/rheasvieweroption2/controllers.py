from django.shortcuts import render
from tethysapp.rheasvieweroption2.model import *

def home(request):
    """
    Controller for the app home page.
    """

    rheas_dbs = get_database()
    db_schemas = get_schemas(cfg.connection['dbname'])
    variable_info = get_variables_meta()
    thredds_wms_url = cfg.thredds_server['wms_url']
    context = {
        "rheas_dbs":rheas_dbs,
        "db_schemas":db_schemas,
        "variable_info":json.dumps(variable_info),
        "thredds_wms_url":thredds_wms_url,
    }

    return render(request, 'rheasvieweroption2/home.html', context)
@csrf_exempt
def vicdssat(request):
    variable_info = get_variables_meta()
    thredds_wms_url = cfg.thredds_server['wms_url']
    context={
        "thredds_wms_url":thredds_wms_url,
        "variable_info": json.dumps(variable_info),
    }
    return render(request,'rheasvieweroption2/vicdssat.html', context)
@csrf_exempt
def outlook(request):
    variable_info = get_variables_meta()
    thredds_wms_url = cfg.thredds_server['wms_url']
    rheas_dbs = get_outlook_database()
    context={
        "rheas_dbs": rheas_dbs,
        "variable_info":json.dumps(variable_info),
          "thredds_wms_url":thredds_wms_url,
    }
    return render(request,'rheasvieweroption2/outlook.html', context)
