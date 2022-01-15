import dynamic from 'next/dynamic';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File
import {
  useController,
  Control,
  Path,
  UnpackNestedValue,
  PathValue,
} from 'react-hook-form';
import { Game } from '@prisma/client';

const SunEditor = dynamic(() => import(`suneditor-react`), {
  ssr: false,
});

const ButtonCustomList = [
  [`undo`, `redo`, `link`],
  [`font`, `fontSize`],
  [`bold`, `underline`, `italic`, `strike`, `subscript`, `superscript`],
  [`removeFormat`],
  [`fontColor`, `hiliteColor`],
  [`outdent`, `indent`],
  [`align`, `horizontalRule`, `list`],
  [`link`],
  [`fullScreen`, `showBlocks`, `codeView`],
];

interface Props<FormValues> {
  control: Control<FormValues, object>;
  name: Path<FormValues>;
  defaultValue?: UnpackNestedValue<PathValue<FormValues, Path<FormValues>>>;
}

function Editor<FormValues>({
  control,
  name,
  defaultValue,
  ...props
}: Props<FormValues>) {
  const {
    field: { value, ...inputProps },
    fieldState: { invalid, isTouched, isDirty },
    formState: { touchedFields, dirtyFields },
  } = useController({
    name,
    control,
    rules: { required: true },
    defaultValue: defaultValue,
  });

  return (
    <SunEditor
      {...props}
      {...inputProps}
      defaultValue={value as string}
      lang="fr"
      setOptions={{
        height: `400`,
        buttonList: ButtonCustomList,
        mode: `balloon`,
      }}
    />
    // <SunEditor
    //   {...props}
    //   {...inputProps}
    //   defaultValue={value}
    //   setOptions={{
    //     height: 200,
    //     buttonList: ButtonCustomList,
    //     mode: 'balloon',
    //   }}
    // />
  );
}

export default Editor;
