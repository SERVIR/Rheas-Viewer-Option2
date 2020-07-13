from django.shortcuts import render
from tethys_sdk.gizmos import MVView,MVDraw,MapView
import tethysapp.rheasvieweroption2.config as cfg
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect
from tethysapp.rheasvieweroption2.model import *

def home(request):
    """
    Controller for the app home page.
    """

    rheas_dbs = get_database()
    db_schemas = get_schemas(cfg.connection['dbname'])
    variable_info = get_variables_meta()
    geoserver_wms_url = cfg.geoserver['wms_url']
    geoserver_rest_url = cfg.geoserver['rest_url']
    geoserver_workspace = cfg.geoserver['workspace']
    context = {
        "rheas_dbs":rheas_dbs,
        "db_schemas":db_schemas,
        "variable_info":json.dumps(variable_info),
        "geoserver_wms_url":geoserver_wms_url,
        "geoserver_rest_url":geoserver_rest_url,
        "geoserver_workspace":geoserver_workspace
    }

    return render(request, 'rheasvieweroption2/home.html', context)
@csrf_exempt
def vicdssat(request):
    variable_info = get_variables_meta()
    geoserver_wfs_url = cfg.geoserver['wfs_url']
    geoserver_wms_url = cfg.geoserver['wms_url']
    geoserver_rest_url = cfg.geoserver['rest_url']
    geoserver_workspace = cfg.geoserver['workspace']
    context={
        "variable_info":json.dumps(variable_info),
        "geoserver_wfs_url":geoserver_wfs_url,
        "geoserver_wms_url":geoserver_wms_url,
        "geoserver_rest_url":geoserver_rest_url,
        "geoserver_workspace":geoserver_workspace
    }
    return render(request,'rheasvieweroption2/vicdssat.html', context)
@csrf_exempt
def outlook(request):
    variable_info = get_variables_meta()
    geoserver_wfs_url = cfg.geoserver['wfs_url']
    geoserver_wms_url = cfg.geoserver['wms_url']
    geoserver_rest_url = cfg.geoserver['rest_url']
    geoserver_workspace = cfg.geoserver['workspace']
    context={
        "variable_info":json.dumps(variable_info),
        "geoserver_wfs_url":geoserver_wfs_url,
        "geoserver_wms_url":geoserver_wms_url,
        "geoserver_rest_url":geoserver_rest_url,
        "geoserver_workspace":geoserver_workspace
    }
    return render(request,'rheasvieweroption2/outlook.html', context)
