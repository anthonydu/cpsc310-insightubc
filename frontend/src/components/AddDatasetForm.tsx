import {Heading, FormControl, Input, Button, FormLabel, Select, Stack} from "@chakra-ui/react";

function AddDatasetForm(props: {
	id: string;
	setId: (id: string) => void;
	kind: string;
	setKind: (kind: string) => void;
	setFile: (file: File | undefined) => void;
	handleAdd: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
	return (
		<form onSubmit={props.handleAdd}>
			<Stack spacing="10px">
				<Heading size="lg">Add Dataset</Heading>
				<FormControl>
					<FormLabel>ID</FormLabel>
					<Input
						type="text"
						value={props.id}
						onChange={(e) => props.setId(e.currentTarget.value)}
						placeholder="ID must not contain '_' and has to be unique"
						onFocus={(e) => (e.target.placeholder = "")}
						onBlur={(e) => (e.target.placeholder = 'ID must not contain "_" and has to be unique')}
						pattern="^[^_]+$"
						required
					/>
				</FormControl>
				<FormControl>
					<FormLabel>Kind</FormLabel>
					<Select value={props.kind} onChange={(e) => props.setKind(e.currentTarget.value)}>
						<option value="sections">Sections</option>
						<option value="rooms" disabled>
							Rooms
						</option>
					</Select>
				</FormControl>
				<FormControl>
					<FormLabel>File</FormLabel>
					<Input
						type="file"
						accept=".zip"
						onChange={(e) => props.setFile(e.currentTarget.files?.[0])}
						required
					/>
				</FormControl>
				<Button type="submit">Submit</Button>
			</Stack>
		</form>
	);
}

export default AddDatasetForm;
