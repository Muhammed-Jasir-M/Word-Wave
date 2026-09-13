export interface AudioInputOptionProps {
  type: "record" | "upload";
  title: string;
  description: string;
  actionText: string;
  onClick?: () => void;
}
