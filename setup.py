import os
import sys
from setuptools import setup, find_namespace_packages
from tethys_apps.app_installation import find_resource_files,custom_develop_command, custom_install_command

# -- Apps Definition -- #
app_package = 'rheasvieweroption2'
release_package = 'tethysapp-' + app_package
app_class = 'rheasvieweroption2.app:Rheasvieweroption2'
app_package_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tethysapp', app_package)


# -- Get Resource File -- #
resource_files = find_resource_files('tethysapp/' + app_package + '/templates','tethysapp/' + app_package )
resource_files += find_resource_files('tethysapp/' + app_package + '/public','tethysapp/' + app_package )

# -- Python Dependencies -- #
dependencies = []

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
    packages=find_namespace_packages(exclude=['ez_setup', 'examples', 'tests']),
    namespace_packages=['tethysapp', 'tethysapp.' + app_package],
    include_package_data=True,
    package_data={'': resource_files},
    zip_safe=False,
    install_requires=dependencies,
    cmdclass={
        'install': custom_install_command(app_package, app_package_dir, dependencies),
        'develop': custom_develop_command(app_package, app_package_dir, dependencies)
    }
)
