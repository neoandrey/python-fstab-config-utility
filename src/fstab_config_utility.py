#!/usr/bin/env python

import yaml
import os
import fstab_config
import argparse
import traceback

Config                  = fstab_config.Mount_Config
parameters              =  {}

class Fstab_Utility:
    config_yaml_file    = None
    config              = None
    fstab_builder       = []
    header              = """"
    fstab_file          = "/etc/fstab"
# /etc/fstab: static file system information.
#
# Use 'blkid' to print the universally unique identifier for a
# device; this may be used with UUID= as a more robust way to name devices
# that works even if disks are added and removed. See fstab(5).
#
# <device>              <mount_point>           <file_system_type>          <options>                   <backup_operation>              <fs_check_order>
"""

    def __init__(self, yaml_file):
        self.config_yaml_file = yaml_file if yaml_file else None
        if os.path.exists(self.config_yaml_file):
            if os.path.isfile(self.config_yaml_file):
                self.fstab_file = parameters['output_file']
                self.read_config()
                if  str.lower(list(self.config.keys())[0])=='fstab':
                    self.fstab_builder.append(self.header)
                    for mount_setting in self.config['fstab'].items():
                        self.fstab_builder.append(Config(mount_setting).print())
                else:
                    print('Config file {c} does not have an \'fstab\' setting'.format(c=self.config_yaml_file)) 
                self.write_config()    
            else:
             print("The configuration file: {f} is not a file".format(f=self.config_yaml_file))   
        else:
            print("The configuration file: {f} does not exist".format(f=self.config_yaml_file))
  
    def read_config(self):
        try:
            with open(r'{}'.format(self.config_yaml_file)) as yml:
                self.config = yaml.load(yml, Loader=yaml.FullLoader)
        except yaml.YAMLError as exc:
            print(exc)
            traceback.print_exc()

    def write_config(self):
        try:
            text_file = open(self.fstab_file, "w")
            n = text_file.write('\n'.join(self.fstab_builder))
            text_file.close()
        except Exception as exc:
            print(exc)
            traceback.print_exc()


parser = argparse.ArgumentParser(description="A tool to configure /etc/fstab files from yaml configuration files")

parser.add_argument("-c",  "--config",        type=str,  default='yaml/fstab.yml', help="The path to the yaml configuration file.")
parser.add_argument("-o",  "--output_file",    type=str,  default='etc/fstab',      help="The default output file which defaults to etc/fstab")
parser.add_argument("-v",  "--verbose",       type=int,  default=0, help="show debug")

args                           = parser.parse_args()
set_argument_count             = 0
if  args.config:
    parameters['config']         = args.config
elif  args.verbose:
    parameters['verbose']       = args.verbose
parameters['output_file']       = args.output_file

if len(parameters) >= 0 and parameters['config']:
    Fstab_Utility(parameters['config'] )
else:
    print("Configuration file not provided. There is insufficient information to proceed")
