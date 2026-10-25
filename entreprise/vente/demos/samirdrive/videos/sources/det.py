import sys,numpy as np
from rembg import remove,new_session
from PIL import Image
from scipy import ndimage
FL='/home/user/Lamaisonduparquet/entreprise/vente/demos/samirdrive/site/img/flotte/'
s=new_session(sys.argv[1] if len(sys.argv)>1 else 'isnet-general-use')
for k in ['livan-blanc','livan-gris','livan-argent','tcross-2']:
    im=Image.open(FL+k+'.jpg').convert('RGB')
    o=remove(im,session=s)
    a=np.array(o.split()[3])>128
    lab,n=ndimage.label(a)
    if n>1:
        sz=ndimage.sum(a,lab,range(1,n+1));keep=lab==(1+int(np.argmax(sz)))
        al=np.array(o.split()[3]);al[~keep]=0;o.putalpha(Image.fromarray(al))
    o.save(k+'.png');print(k,im.size,n)
