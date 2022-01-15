import Editor from '@/components/Editor';
import { Form } from '@/components/Form';
import { ButtonSubmit } from '@/styles/components/buttons';
import { FormItemWrapper } from '@/styles/components/formItemWrapper';
import { Input } from '@/styles/components/input';
import { Label } from '@/styles/components/labels';
import { Game } from '@prisma/client';
import { useMutation, UseMutationResult } from 'react-query';
import updateGame from '../../api/updateGame';

type FormValues = {
  name: string;
  description: string;
};

interface Props {
  game: Game;
}

interface Context {
  id: string;
}

const FormJeu = ({ game }: Props) => {
  const mutation: UseMutationResult<Game, Error, Game> = useMutation<
    Game,
    Error,
    Game,
    Context | undefined
  >(
    async (game: Game) => {
      console.log(game.id);
      return updateGame(game);
    },
    {
      // if mutation errors
      onError: (
        error: Error,
        _variables: Game,
        context: Context | undefined,
      ) => {
        console.log(`🤒 error: `, error.message);
        return console.log(
          `rolling back optimistic update with id: ${context?.id}`,
        );
      },
      // on success of mutation
      onSuccess: (
        data: Game,
        _variables: Game,
        context: Context | undefined,
      ) => {
        // queryClient.invalidateQueries('person');
        return console.log(`🚀 mutation data`, data);
      },
      // no matter if error or success run me
      onSettled: (
        _data: Game | undefined,
        _error: Error | null,
        _variables: Game | undefined,
        _context: Context | undefined,
      ) => {
        return console.log(`complete mutation!`);
      },
    },
  );

  const onSubmit = (formValues: FormValues) => {
    const gameUpdated = {
      ...game,
      name: formValues.name,
      description: formValues.description,
    };
    console.log(`🅰️ : game updated before prisma 🅰️ `, gameUpdated.name);
    mutation.mutate(gameUpdated);
  };

  return (
    <Form<FormValues> onSubmit={onSubmit}>
      {({ register, formState, control }) => (
        <>
          <FormItemWrapper>
            <Label>Titre</Label>
            <Input type="text" {...register(`name`)} defaultValue={game.name} />
          </FormItemWrapper>
          <Label>Description</Label>
          <Editor
            name="description"
            defaultValue={game.description}
            control={control}
          />
          <ButtonSubmit type="submit">envoyer</ButtonSubmit>
        </>
      )}
    </Form>
  );
};

export default FormJeu;
