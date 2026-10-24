export const resume = {
  url: '/resume/Aayan-Amir-Resume.pdf',
  filename: 'Aayan Amir Resume.pdf',
};

/** The mesh has no native link; invoke the same local download used by HTML links. */
export function downloadResume() {
  const link = document.createElement('a');
  link.href = resume.url;
  link.download = resume.filename;
  document.body.append(link);
  link.click();
  link.remove();
}
