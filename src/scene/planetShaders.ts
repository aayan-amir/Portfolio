// Surface detail lives in object space; illumination lives in view space.
// This separation keeps the visible hemisphere legible at every globe rotation.
export const planetVertex = `varying vec3 vP;varying vec3 vN;varying vec3 vView;varying vec2 vUv;
void main(){vP=position;vN=normalize(normalMatrix*normal);vUv=uv;vec4 view=modelViewMatrix*vec4(position,1.);vView=view.xyz;gl_Position=projectionMatrix*view;}`;
export const planetFragment = `varying vec3 vP;varying vec3 vN;varying vec3 vView;varying vec2 vUv;
uniform vec3 tint;uniform int kind;uniform float time;uniform sampler2D surfaceMap;uniform bool hasSurface;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){return noise(p)*.56+noise(p*2.03)*.27+noise(p*4.11)*.12+noise(p*8.17)*.05;}
vec3 pigment(vec3 c){return pow(c,vec3(2.2));}
void main(){vec3 p=normalize(vP);float n=fbm(p*6.);vec3 c=tint;
 if(hasSurface&&kind<8){c=texture2D(surfaceMap,vUv).rgb;}else{
 if(kind==0){if(hasSurface){c=texture2D(surfaceMap,vUv).rgb;}else{float land=smoothstep(.51,.57,fbm(p*4.));c=mix(pigment(vec3(.12,.4,.66)),pigment(vec3(.41,.57,.32)),land);}float cloud=smoothstep(.62,.76,fbm(p*12.+vec3(1.3,0,0)));c=mix(c,pigment(vec3(.94,.97,.98)),cloud*.64);}
 if(kind==1){c=mix(pigment(vec3(.43,.39,.34)),pigment(vec3(.77,.73,.66)),n);c*=.85+.3*noise(p*31.); }
 if(kind==2){float swirls=sin(p.y*17.+fbm(p*7.)*5.);float vapor=fbm(p*12.);c=mix(pigment(vec3(.76,.56,.29)),pigment(vec3(.98,.87,.63)),.47+.25*swirls+.22*vapor);}
 if(kind==3){float patches=fbm(p*4.);c=mix(pigment(vec3(.52,.29,.2)),pigment(vec3(.88,.55,.34)),smoothstep(.3,.69,patches));c*=.9+.24*n;c=mix(c,pigment(vec3(.91,.85,.73)),smoothstep(.88,.985,abs(p.y))*.85);}
 if(kind==4){float latitude=p.y+(.02*noise(p*13.));float wave=.5+.5*sin(latitude*53.+sin(latitude*9.)*1.1);c=mix(pigment(vec3(.69,.43,.28)),pigment(vec3(.94,.85,.69)),smoothstep(.15,.85,wave));c=mix(c,pigment(vec3(.95,.9,.79)),smoothstep(.65,.8,noise(vec3(latitude*50.,0,0)))*.6);float lon=atan(p.z,p.x);float dx=atan(sin(lon+1.5),cos(lon+1.5));float storm=exp(-pow(dx/.25,2.)-pow((p.y+.24)/.085,2.));c=mix(c,pigment(vec3(.77,.37,.22)),storm*.85);}
 if(kind==5){float band=.5+.5*sin(p.y*76.+fbm(p*7.)*.8);c=mix(pigment(vec3(.75,.65,.46)),pigment(vec3(.94,.85,.66)),.38+.42*band);c*=.95+.1*n;}
 if(kind==6){float band=.5+.5*sin(p.y*13.+n*.3);c=mix(pigment(vec3(.41,.72,.75)),pigment(vec3(.69,.87,.84)),.38+.22*band);}
 if(kind==7){float band=.5+.5*sin(p.y*26.+noise(p*8.)*.5);c=mix(pigment(vec3(.16,.36,.74)),pigment(vec3(.37,.62,.92)),.4+.35*band);float streak=smoothstep(.72,.89,fbm(p*18.))*smoothstep(.15,.7,p.y);c=mix(c,pigment(vec3(.7,.83,.98)),streak*.42);}
 }

 vec3 normal=normalize(vN);float key=max(dot(normal,normalize(vec3(-.45,.5,1.))),0.);float fill=max(dot(normal,normalize(vec3(.75,-.1,.6))),0.);float light=.36+.65*key+.12*fill;c*=light;
 if(kind==8){float fire=fbm(p*13.+vec3(0,time*.09,0));float granules=noise(p*80.);c=hasSurface?texture2D(surfaceMap,vUv).rgb:mix(pigment(vec3(1.,.23,.015)),pigment(vec3(1.,.74,.19)),smoothstep(.35,.78,fire));c*=vec3(1.28,.94,.76)*(1.03+granules*.07);}
 gl_FragColor=vec4(c,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
export const atmosphereFragment = `varying vec3 vN;varying vec3 vView;uniform vec3 tint;uniform float strength;void main(){float rim=pow(1.-abs(dot(normalize(vN),normalize(-vView))),3.);gl_FragColor=vec4(tint,rim*strength);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
export const ringVertex = `varying float radius;void main(){radius=length(position.xy);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const ringFragment = `varying float radius;uniform bool ice;void main(){float inner=ice?7.8:8.15;float outer=ice?8.52:12.15;float t=(radius-inner)/(outer-inner);float edge=smoothstep(0.,.035,t)*(1.-smoothstep(.96,1.,t));float fine=.5+.5*sin(radius*58.)*sin(radius*19.);float gap=ice?1.:(1.-smoothstep(10.08,10.14,radius)*(1.-smoothstep(10.3,10.36,radius)));vec3 c=ice?mix(vec3(.51,.78,.79),vec3(.78,.9,.85),fine):mix(vec3(.55,.46,.32),vec3(.93,.85,.67),.38+fine*.43);float alpha=edge*gap*(ice?.45:.84);if(alpha<.02)discard;gl_FragColor=vec4(pow(c,vec3(2.2)),alpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
