import { useState } from 'react';
import { pl } from '../../../content/pl';
import { Button } from '../../../components/ui/Button';
import { TextArea } from '../../../components/ui/Field';
import type { StepProps } from '../types';

interface ReleaseStepProps extends StepProps {
  onRelease: (reflection: string) => void;
}

export function ReleaseStep({ registerField, goTo, onRelease }: ReleaseStepProps) {
  const [reflection, setReflection] = useState('');
  const content = pl.steps['realism-release'];
  return (
    <>
      <TextArea
        ref={registerField}
        label={content.label!}
        placeholder={content.placeholder}
        value={reflection}
        onValueChange={setReflection}
        hint={pl.common.optional}
      />
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => onRelease(reflection)}>{pl.release.confirm}</Button>
        <Button variant="secondary" onClick={() => goTo('realism')}>
          {pl.release.cancel}
        </Button>
      </div>
    </>
  );
}
