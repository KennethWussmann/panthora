import {
  Box,
  Container,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { useTeam } from "@/lib/SelectedTeamProvider";
import { api } from "@/utils/api";

export default function Dashboard() {
  const { team } = useTeam();
  const { data: stats } = api.stats.get.useQuery(
    {
      teamId: team?.id ?? "",
    },
    { enabled: !!team }
  );
  return (
    <Box as="section" py={{ base: "4", md: "8" }}>
      <Container>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: "5", md: "6" }}>
          <Stat>
            <StatLabel>Total Assets</StatLabel>
            <StatNumber>{stats?.assets}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Asset Types</StatLabel>
            <StatNumber>{stats?.assetTypes}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Tags</StatLabel>
            <StatNumber>{stats?.tags}</StatNumber>
          </Stat>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
