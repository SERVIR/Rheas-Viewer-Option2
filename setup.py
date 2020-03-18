import os
import sys
from setuptools import setup, find_namespace_packages
from tethys_apps.app_installation import find_resource_files

# -- Apps Definition -- #
app_package = 'rheasvieweroption2'
release_package = 'tethysapp-' + app_package

# -- Get Resource File -- #
resource_files = find_resource_files('tethysapp/' + app_package + '/templates','tethysapp/' + app_package )
resource_files += find_resource_files('tethysapp/' + app_package + '/public','tethysapp/' + app_package )

# -- Python Dependencies -- #
dependencies = ['xmltodict']

setup(
    name=release_package,
    version='0.0.1',
    tags='&quot;VIC&quot;,&quot;DSSAT&quot;',
    description='Integration of VIC and DSSAT in to on Viewer',
    long_description='',
    keywords='',
    author='Githika Tondapu',
    author_email='',
    url='',
    license='',
    packages=find_namespace_packages(),
    include_package_data=True,
    package_data={'': resource_files},
    zip_safe=False,
    install_requires=dependencies,
)
