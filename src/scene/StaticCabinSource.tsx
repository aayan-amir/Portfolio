import { CabinShell } from './CabinShell';
import { IntegratedWorkbench, ReadingNook, PersonalDetails } from './Workbench';
import { WallDecor } from './WallDecor';
import { DroneDock } from './CabinInstruments';
/** Editable procedural source and failure fallback for the prebuilt static room. */
export function StaticCabinSource() {
  return (
    <group name="cabin-static-source">
      <group name="Hull">
        <CabinShell body="earth" />
      </group>
      <group name="Workbench">
        <IntegratedWorkbench />
      </group>
      <group name="ReadingNook">
        <ReadingNook />
      </group>
      <group name="PersonalDetails">
        <PersonalDetails />
      </group>
      <group name="WallDecor">
        <WallDecor
          includePersonal={false}
          personalNote={false}
          onDiscover={() => {}}
        />
      </group>
      <group name="DroneDock">
        <DroneDock />
      </group>
    </group>
  );
}
