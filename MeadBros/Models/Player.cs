namespace MeadBros.Models
{
    public abstract class Player
    {
        public string Name { get; set; }
        public string ConnectionId { get; protected set; }

        public Player() {}

        public Player(string connectionId)
        {
            ConnectionId = connectionId;
        }

        public void SetDetails(string connectionId, string name)
        {
            if (string.IsNullOrEmpty(ConnectionId))
            {
                ConnectionId = connectionId;
                Name = name;
            }
        }
    }
}
