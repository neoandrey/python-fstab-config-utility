#!/usr/bin/env python


class Mount_Config:
    device                     = None
    mount_point                = None
    filesystem_type            = "ext3"             # set default file system to xfs
    options                    = "defaults"         # set default options to 'defaults'
    backup_operation           = 0                  # set file dump option
    fs_check_order             = 0                  # file system check order
    export                     = None               # remote folder path for nfs filesystems
    root_reserve               = None               # value to change the default 5% root-reserve settings on ext filesystems
    allowed_filesystems        = ['ext','ext2','ext3','ext4','hpfs','iso9660','JFS','minix','msdos','ncpfs', 'nfs','ntfs','proc','Reiserfs','smb','sysv','umsdos','vfat','xfs','xiafs']
    spacing                    = '\t'
    
    def is_valid_filesystem(self,fs):
        return  str.lower(fs) in  self.allowed_filesystems

    def __init__(self, config_options):
        self.device            = config_options[0]
        self.mount_point       = config_options[1]['mount']
        self.filesystem_type   = config_options[1]['type']              if 'type' in  config_options[1].keys()                       else  self.filesystem_type   # set default file system type to "ext3" 
        self.options           = config_options[1]['options']           if 'options' in  config_options[1].keys()          else  self.options   
        self.backup_operation  = config_options[1]['backup_operation']  if 'backup_operation' in  config_options[1].keys() else  self.backup_operation   
        self.fs_check_order    = config_options[1]['fs_check_order']    if 'fs_check_order' in  config_options[1].keys()   else  self.fs_check_order
        self.export            = config_options[1]['export']            if 'export' in  config_options[1].keys()           else  self.export
        self.root_reserve      = config_options[1]['root-reserve']      if 'root-reserve' in  config_options[1].keys()    else  self.root_reserve
    
    def print(self):
        fstab_line_builder = []
        device_mount       = None
        mount_point        = None
        options            = ''
        check_order        = 0
        if self.is_valid_filesystem(self.filesystem_type):
            device_mount       = self.device
            if self.filesystem_type == 'nfs' and  self.export:
                device_mount = self.device+ ':' +  self.export
            elif self.filesystem_type == 'nfs' and  not self.export:
                 print("insufficient information for nfs mount point:{p}".format(p=device_mount))
                 return
            fstab_line_builder.append(device_mount)
            fstab_line_builder.append(self.spacing)
            mount_point = self.mount_point
            fstab_line_builder.append(3*self.spacing)
            fstab_line_builder.append(mount_point) 
            fstab_line_builder.append(6*self.spacing)  
            fstab_line_builder.append(self.filesystem_type)
            fstab_line_builder.append(5*self.spacing)
            options     = ','.join(self.options) if isinstance(self.options, list) else self.options
            if self.root_reserve:
                options +='usrquota,grpquota'           # use usrquota,grpquota to manage root reserve settings 
            fstab_line_builder.append(options)
            fstab_line_builder.append(6*self.spacing) 
            fstab_line_builder.append(str(self.backup_operation))
            fstab_line_builder.append(3*self.spacing)
            check_order   = self.fs_check_order
            if mount_point == "/":
                check_order = 1 
            fstab_line_builder.append(str(check_order))
            return ''.join(fstab_line_builder)            
        else:
          print("Filesystem: {f} is invalid.".format(self.filesystem_type))
