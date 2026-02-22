import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
    <div>
      <h1 className="text-2xl font-extrabold text-foreground font-heading">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
    {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
  </div>
);

export default PageHeader;
