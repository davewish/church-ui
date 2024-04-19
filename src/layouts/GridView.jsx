import { Grid } from "@mui/material";
import { makeStyles } from "@mui/styles";

import CardView from "~/components/Card";
import useGridData from "~/hooks/useGridData";

import config from "../constants/endpoints.json";

const currentConfig = import.meta.env.MODE === "development" ? config.test : config.prod;

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1
  },
  grid: {
    width: "100%",
    justifyContent: "center"
  }
}));

export default function GridView() {
  const classes = useStyles();
  const { cardData } = useGridData(currentConfig.contentData);

  return (
    <Grid container className={classes.grid}>
      {cardData &&
        cardData.map((data) => (
          <Grid item xs={12} sm={6} lg={4} key={data.id}>
            <CardView data={data} />
          </Grid>
        ))}
    </Grid>
  );
}
