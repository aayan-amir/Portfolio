"""Reproducible Blender asset authoring. Blender --background --python this.py -- [--bake]."""
import bpy, math, os, sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
FONT=bpy.data.fonts.load(str(ROOT/'assets/source/fonts/DM-Sans.ttf'))
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=48;scene.cycles.use_denoising=True
scene.world.color=(.08,.1,.13)
def linear(v):return ((v+.055)/1.055)**2.4 if v>.04045 else v/12.92
def rgb(h):return tuple(linear(int(h[i:i+2],16)/255) for i in (1,3,5))
materials={}
def mat(name,color,metal=.0,rough=.5,emit=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*rgb(color),1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*rgb(color),1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 if emit:p.inputs['Emission Color'].default_value=(*rgb(color),1);p.inputs['Emission Strength'].default_value=emit
 materials[name]=m;return m
navy=mat('Midnight enamel','#102B39',.18,.4);teal=mat('Petrol powdercoat','#244C56',.25,.42);cream=mat('Warm ceramic','#EEECE2',.04,.55);cyan=mat('Cyan details','#76BDB5',.2,.38);amber=mat('Anodised amber','#D7A567',.3,.4);coral=mat('Coral controls','#C96F57',.15,.48);metal=mat('Brushed aluminium','#889B9B',.65,.38);dark=mat('Screen inset','#081922',.1,.55);ink=mat('Lettering','#BBD6CE',.0,.6);white=mat('Warm task diffuser','#FFF0CE',0,.45,2)
BASE=(0,0,0);PARENT=None;static=[]
def pos(p):return (p[0],-p[2],p[1])
def parent(obj):
 global PARENT
 if PARENT:
  mw=obj.matrix_world.copy();obj.parent=PARENT;obj.matrix_world=mw
 else:static.append(obj)
 return obj
def block(name,p,size,material,r=.04):
 p=tuple(p[i]+BASE[i] for i in range(3));bpy.ops.mesh.primitive_cube_add(size=1,location=pos(p));o=bpy.context.object;o.name=name;o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if r:
  b=o.modifiers.new('Machined radiused edges','BEVEL');b.width=min(r,min(size)*.45);b.segments=3;bpy.ops.object.modifier_apply(modifier=b.name)
  n=o.modifiers.new('Face weighted normals','WEIGHTED_NORMAL');n.keep_sharp=True;bpy.ops.object.modifier_apply(modifier=n.name)
 o.data.materials.append(material);return parent(o)
def cyl(name,p,radius,depth,material):
 p=tuple(p[i]+BASE[i] for i in range(3));bpy.ops.mesh.primitive_cylinder_add(vertices=48,radius=radius,depth=depth,location=pos(p));o=bpy.context.object;o.name=name;o.data.materials.append(material)
 b=o.modifiers.new('Soft machined edge','BEVEL');b.width=min(.025,depth*.2);b.segments=3;bpy.ops.object.modifier_apply(modifier=b.name)
 for f in o.data.polygons:f.use_smooth=True
 return parent(o)
def tube(name,points,r,material):
 curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.bevel_depth=r;curve.bevel_resolution=3
 sp=curve.splines.new('POLY');sp.points.add(len(points)-1)
 for v,p in zip(sp.points,points):v.co=(*pos(tuple(p[i]+BASE[i] for i in range(3))),1)
 o=bpy.data.objects.new(name,curve);scene.collection.objects.link(o);o.data.materials.append(material);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False);return parent(o)
def text(label,p,size=.13,material=ink,center=False):
 p=tuple(p[i]+BASE[i] for i in range(3));bpy.ops.object.text_add(location=pos(p));o=bpy.context.object;o.name='Engraving '+label;o.data.body=label;o.data.font=FONT;o.data.align_x='CENTER' if center else 'LEFT';o.data.size=size;o.data.resolution_u=8;o.data.extrude=0;o.rotation_euler=(math.pi/2,0,0);o.data.materials.append(material);bpy.ops.object.convert(target='MESH');return parent(o)
def polygon(name,points,y,height,material):
 n=len(points);verts=[pos((x,y+h,z)) for h in (0,height) for x,z in points];faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);o.data.materials.append(material)
 bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT');b=o.modifiers.new('Continuous soft rim','BEVEL');b.width=.07;b.segments=4;bpy.ops.object.modifier_apply(modifier=b.name);o.select_set(False);return parent(o)
def empty(name,p=(0,0,0)):
 o=bpy.data.objects.new(name,None);scene.collection.objects.link(o);o.location=pos(p);return o
def nameplate(label,z):
 block(label+' inset nameplate',(0,.13,z),(1.72,.25,.045),teal,.025)
 text(label,(0,.055,z+.026),.23,cream,center=True)

# An inhabited cutaway, composed around the bench rather than a box of furniture.
block('Quiet identity wall',(-4.4,3.0,-3.8),(4.2,6.4,.24),navy,.1)
block('Port wall return',(-6.5,2.8,-.8),(.25,5.7,6.0),teal,.1)
block('Starboard wall return',(6.5,2.8,-.8),(.25,5.7,6.0),teal,.1)
block('Window sill',(2.2,1.08,-3.8),(8.6,1.7,.35),teal,.12)
block('Window crown',(2.2,6.0,-3.8),(8.8,.7,.35),navy,.12)
# Rounded continuous viewport frame, deliberately without a glass plane.
pts=[]
for cx,cy,start in [(5.9,5.2,0),(-1.5,5.2,90),(-1.5,2.0,180),(5.9,2.0,270)]:
 for j in range(17):
  a=math.radians(start+j*90/16);pts.append((cx+.5*math.cos(a),cy+.5*math.sin(a),-3.62))
pts.append(pts[0]);tube('Single continuous viewport gasket',pts,.105,metal)
block('Overhead arch',(0,6.05,7.2),(13,.22,22.0),navy,.07)
for x in [-5.7,5.7]:
 tube('Structural swept rib',[(x,.0,2),(x,4.8,2),(x,5.75,.8),(x,5.8,-3.7)],.09,metal)
block('Port task light',(-3.0,5.65,-1.4),(2.0,.06,.18),white,.025)
block('Starboard task light',(3.2,5.65,-1.4),(2.0,.06,.18),white,.025)
# Elliptical deck and inset seams.
o=cyl('Orbital deck',(0,-.2,.0),7.8,.3,teal);o.scale.y=.85
for radius in [6.8,7.35]:tube('Deck inlay',[(radius*math.cos(i*2*math.pi/128),-.037,.85*radius*math.sin(i*2*math.pi/128)) for i in range(129)],.012,metal)
# One continuous curved workbench.
outline=[(-4.5,-1.15),(-2.8,-1.45),(0,-1.55),(2.8,-1.45),(4.5,-1.15),(4.75,-.5),(4.55,.65),(3.65,1.35),(2,1.8),(0,1.98),(-2,1.8),(-3.65,1.35),(-4.55,.65),(-4.75,-.5)]
polygon('Sculptural lower bench',outline,1.05,.24,navy)
polygon('Continuous ceramic work surface',[(x*.995,z*.995) for x,z in outline],1.29,.12,cream)
tube('Front amber reveal',[(-4.52,.99,.6),(-3.65,.99,1.35),(-2,.99,1.8),(0,.99,1.98),(2,.99,1.8),(3.65,.99,1.35),(4.52,.99,.6)],.024,amber)
for x in [-3.2,3.2]:
 block('Swept bench pedestal',(x,.52,-.15),(.48,1.1,1.8),teal,.16)
 block('Pedestal foot',(x,.04,-.1),(1.15,.15,2.0),navy,.06)
 for i in range(5):block('Pedestal inset',(x-.15+i*.075,.58,.77),(.025,.45,.015),dark,.005)
# Quiet wall details and desk wiring.
for y in [1.9,2.3]:block('Port wall panel seam',(-5.1,y,-3.63),(2.8,.018,.015),metal,.002)


for x in [-3.7,0,3.7]:tube('Contained cable run',[(x,.8,-1.3),(x,.4,-1.4),(x*.7,.3,-2.2)],.032,navy)
# One small personal vignette, not another exhibit.
cyl('Ceramic cup',(-4.05,1.57,.1),.15,.3,coral);cyl('Cup dark opening',(-4.05,1.73,.1),.117,.012,dark)
tube('Cup handle',[(-4.18,1.65,.1),(-4.32,1.64,.1),(-4.33,1.46,.1),(-4.18,1.46,.1)],.025,coral)
# Assemble project groups; positions match projectPresentation.ts.
roots=[]
def project(name,p):
 global BASE,PARENT
 BASE=p;PARENT=empty('project-'+name,p);roots.append(PARENT);return PARENT
def mechanism(name,p):
 global PARENT
 root=PARENT;o=empty(name,tuple(BASE[i]+p[i] for i in range(3)));o.parent=root;o.matrix_parent_inverse=root.matrix_world.inverted();PARENT=o;return root
# NoClash: fold-out light table with real timetable, input strips and tactile hinges.
project('noclash',(0,1.43,.55))
block('Planner chassis',(0,.11,0),(2.75,.22,1.45),navy,.12)
block('Planner cyan fascia',(0,.22,.55),(2.58,.11,.18),cyan,.035)
for x in [-1.14,1.14]:
 cyl('Planning hinge',(x,.34,-.35),.11,.16,amber)
block('Planning light table',(0,.65,-.22),(2.55,1.0,.14),cream,.08)
block('Weekly schedule inset',(0,.65,-.135),(2.28,.78,.018),dark,.025)
# Surface image on the actual instrument; legitimate product capture.
image=bpy.data.images.load(str(ROOT/'public/evidence/noclash.webp'));m=bpy.data.materials.new('Actual NoClash application');m.use_nodes=True;n=m.node_tree.nodes;n.clear();out=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');tex=n.new('ShaderNodeTexImage');tex.image=image;m.node_tree.links.new(tex.outputs['Color'],em.inputs['Color']);m.node_tree.links.new(em.outputs[0],out.inputs['Surface'])
bpy.ops.mesh.primitive_plane_add(size=2,location=pos((0,BASE[1]+.65,BASE[2]-.12)));o=bpy.context.object;o.name='Actual weekly timetable';o.scale=(1.12,.38,1);o.rotation_euler=(math.pi/2,0,0);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(m);parent(o)

root=mechanism('planner-input',(-.85,.33,.3))
for i in range(3):block('Timetable input strip',(-.9+i*.7,.35,.28),(.58,.04,.28),[coral,amber,cyan][i],.02)
PARENT=root
root=mechanism('planner-wing',(-1.32,.4,-.22));block('Folding review leaf',(-1.73,.61,-.23),(.75,.82,.1),teal,.06)
for i in range(4):block('Review slot',(-1.73,.35+i*.16,-.165),(.52,.065,.018),cyan if i!=2 else coral,.009)
PARENT=root

nameplate('NoClash',.755)
# Student Portal: layered physical archive and moving submission tray.
project('student-portal',(-2.9,1.43,-.35))
block('Archive foundation',(0,.1,0),(1.8,.2,1.6),navy,.09)
block('Archive housing',(0,.75,-.25),(1.75,1.25,.65),teal,.1)
for i in range(4):
 block('Publication slot',(0,.37+i*.27,.105),(1.45,.19,.075),dark,.025)
 block('Published file tab',(-.38,.37+i*.27,.16),(.56,.09,.025),cream,.015)
 block('Published status',( .5,.37+i*.27,.16),(.14,.04,.025),cyan,.005)

root=mechanism('archive-tray',(0,.23,.45));block('Pending submission tray',(0,.23,.45),(1.45,.13,.72),amber,.04)
block('Submitted resource',(0,.32,.4),(1.05,.025,.48),cream,.018)
PARENT=root
nameplate('Student Portal',.825)
# NoTerm: maintenance cartridge, command preview, and meaningful review lever.
project('noterm',(2.9,1.43,-.2))
block('Maintenance foundation',(0,.12,0),(1.9,.24,1.3),navy,.1)
block('Maintenance housing',(0,.65,-.14),(1.85,.95,.48),cream,.09)
block('Command preview',(0,.69,.115),(1.54,.62,.025),dark,.025)
text('$ df -h',(0,.60,.14),.26,ink,center=True)
for x in [-.55,-.15,.25]:cyl('Task selector',(x,.29,.4),.085,.065,coral if x==-.55 else metal)
root=mechanism('terminal-lever',(.78,.3,.4));tube('Review lever',[(.78,.3,.4),(.78,.76,.4)],.04,metal);block('Review grip',(.78,.78,.4),(.27,.13,.15),coral,.045)
PARENT=root
nameplate('NoTerm',.675)
# Secondary objects retain their actual responsibilities.
def folio(label,cover):
 block(label+' folio',(0,.08,0),(.92,.16,.62),cover,.03)
 block(label+' paper',(0,.17,-.025),(.78,.025,.49),cream,.01)
 block(label+' permanent nameplate',(0,.12,.335),(.94,.24,.04),teal,.02)
 text(label,(0,.055,.36),.18,cream,center=True)
project('career',(-4.0,1.43,.75));folio('About',amber)
cyl('Profile head',(-.22,.195,-.12),.075,.016,cyan)
block('Profile shoulders',(-.22,.194,.035),(.23,.015,.10),cyan,.025)
for z in [-.12,.0,.12]:block('Profile detail',(.14,.194,z),(.29,.012,.025),teal,.005)
project('resume',(4.03,1.43,.75));folio('Résumé',cream)
for i,z in enumerate([-.18,-.045,.09]):block('Resume lines',(0,.195,z),(.58 if i==0 else .46,.012,.025),teal,.005)
project('contact',(4.1,1.43,-.85));block('Radio',(0,.18,0),(.56,.36,.35),coral,.06);cyl('Radio tuning',(0,.4,0),.1,.06,metal)
BASE=(0,0,0);PARENT=None
# Authoring lights are used for the bake and retained in the editable blend.
def area(name,p,energy,size,color):
 d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.shape='DISK';d.size=size;d.color=rgb(color);o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=pos(p);o.rotation_euler=(Vector(pos((0,1.5,0)))-o.location).to_track_quat('-Z','Y').to_euler();return o
area('Large warm task key',(-3,6,4),1600,7,'#FFF0D9');area('Cool orbital fill',(5,5,-2),1300,6,'#BDD9E5');area('Soft frontal fill',(0,3,7),650,5,'#DBE7DD')
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/source/orbital-workbench.blend'))
# Apply transformations and collapse meshes by material within semantic mechanism groups.
def merge_materials(objects):
 buckets={}
 for o in objects:
  if o.type=='MESH' and len(o.data.materials)==1:buckets.setdefault((o.parent,o.data.materials[0].name),[]).append(o)
 for (par,_),items in buckets.items():
  if len(items)<2:continue
  bpy.ops.object.select_all(action='DESELECT')
  for o in items:o.select_set(True)
  bpy.context.view_layer.objects.active=items[0];bpy.ops.object.join()
# Optional Cycles bake: compare this fixed scene with its lit counterpart before accepting.
if '--bake' in sys.argv:
 bpy.ops.object.select_all(action='DESELECT')
 for o in static:o.select_set(True)
 bpy.context.view_layer.objects.active=static[0];bpy.ops.object.join();fixed=bpy.context.object;fixed.name='baked-studio'
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.15192,island_margin=.02);bpy.ops.object.mode_set(mode='OBJECT')
 atlas=bpy.data.images.new('Studio illumination atlas',width=1024,height=1024)
 for m in fixed.data.materials:
  tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=atlas;m.node_tree.nodes.active=tex
 scene.render.bake.use_pass_glossy=False;scene.render.bake.use_pass_transmission=False;scene.render.bake.use_pass_direct=True;scene.render.bake.use_pass_indirect=True;scene.render.bake.use_pass_color=True
 bpy.ops.object.bake(type='COMBINED',margin=8)
 atlas.filepath_raw=str(ROOT/'assets/source/studio-lighting.png');atlas.file_format='PNG';atlas.save()
 baked=bpy.data.materials.new('Baked studio illumination');baked.use_nodes=True;n=baked.node_tree.nodes;n.clear();out=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');tex=n.new('ShaderNodeTexImage');tex.image=atlas;baked.node_tree.links.new(tex.outputs['Color'],em.inputs['Color']);baked.node_tree.links.new(em.outputs[0],out.inputs['Surface']);fixed.data.materials.clear();fixed.data.materials.append(baked)
 for f in fixed.data.polygons:f.material_index=0
else:merge_materials(static)
for root in roots:merge_materials([o for o in scene.objects if o.parent==root])
# Export only render assets, excluding authoring lights.
bpy.ops.object.select_all(action='DESELECT')
for o in scene.objects:
 if o.type in ['MESH','EMPTY']:o.select_set(True)
output=ROOT/'output'/'orbital-workbench.glb'
bpy.ops.export_scene.gltf(filepath=str(output),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_image_format='WEBP',export_image_quality=85)
print('WORKBENCH_EXPORT',output)
