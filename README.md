## FSTAB Configuration Utility

FSTAB Configuration Utility is a handy tool written in python for creating FSTAB files from YAML Configuration files.  It takes in a yaml configuration file as input and generates an fstab file as output:

    python src/fstab_config_utility.py -c yaml/fstab.yml  -o etc/fstab
 
where:

    -c is the path to the yaml configuration file and
    -o is the path to the output fstab file

The parsing of yaml files in done with the  help of the pyyaml python module which is listed as one of the application requirements  in the requirements.txt file.

A default yaml configuration file in the yaml folder is used if no configuration file is given as input and the default output file is etc\fstab file. 

## Structure of the FSTAB Configuration Utility

The application consists of 2 main classes:

1. Fstab_Utility
2. Mount_Config


#### Fstab_Utility
This class serves as the main class of the  application. it reads the input yaml file and generates the output fstab file. It also calls the **Mount_config** class for each mount point defined in the yaml configuration file

#### Mount_Config

This class attempts to represent each line of the fstab as an object. It defines the properties of mount points based on the configuration passed from the **Fstab_Utility** class. It also sets specific configurations for nfs filesystems and root-reserve options. It has a method that converts the mount_point to a single line in the output fstab file.
