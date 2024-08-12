import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Link from "next/link";
import {Link as MUILink} from "@mui/material";

type Props = {
	variant?: "simple" | "general";
};

const Header: React.FC<Props> = ({variant = "general"}) => {
	return (
		<AppBar position="static">
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					<MUILink
						component={Link}
						href="/"
						variant="h6"
						sx={{
							mr: 2,
							flexGrow: 1,
							fontWeight: 700,
							color: "inherit",
							textDecoration: "none",
						}}
					>
						DH-Marvel
					</MUILink>
					{variant === "general" && (
						<Box>
							<MUILink
								component={Link}
								href="/faq"
								variant="body2"
								sx={{color: "white", fontSize: 18, fontWeight: 600}}
							>
								FAQ
							</MUILink>
						</Box>
					)}
				</Toolbar>
			</Container>
		</AppBar>
	);
};

export default Header;
