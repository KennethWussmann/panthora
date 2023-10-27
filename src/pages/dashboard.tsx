import {
  Box,
  Container,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";

const stats = [
  { label: "Assets", value: "1,320" },
  { label: "Avg. Open Rate", value: "56.87%" },
  { label: "Avg. Click Rate", value: "12.87%" },
];
export default function Dashboard() {
  return (
    <Box as="section" py={{ base: "4", md: "8" }}>
      <Container>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: "5", md: "6" }}>
          {stats.map(({ label, value }) => (
            <Stat key={label}>
              <StatLabel>{label}</StatLabel>
              <StatNumber>{value}</StatNumber>
            </Stat>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
