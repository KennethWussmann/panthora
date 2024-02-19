import { Td, Tr } from "@chakra-ui/react";
import { type Team } from "@prisma/client";

export const TeamRow = ({ team }: { team: Team }) => {
  return (
    <Tr>
      <Td>{team.createdAt.toISOString()}</Td>
      <Td>{team.name}</Td>
    </Tr>
  );
};
