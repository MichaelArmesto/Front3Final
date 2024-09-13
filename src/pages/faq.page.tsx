// pages/faq.page.tsx

import React from 'react';
import LayoutGeneral from 'dh-marvel/components/layouts/layout-general';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Container } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import faqsData from '../data/faqs.json';

interface FAQ {
  title: string;
  description: string;
}

const FAQPage: React.FC = () => {
  return (
    <LayoutGeneral>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        minHeight="90vh"
      >
        {/* preguntas frecuentes */}
        <Container maxWidth="md" sx={{ flexGrow: 1 }}>
          <Box my={4}>
            <Typography variant="h4" gutterBottom textAlign="center">
              Preguntas Frecuentes
            </Typography>
            {faqsData.map((faq: FAQ, index: number) => (
              <Accordion key={index}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{faq.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{faq.description}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>
    </LayoutGeneral>
  );
};

export default FAQPage;
